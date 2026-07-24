import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosResponse } from 'axios'

import { BalanceAdminScreen } from '@/features/Balance/BalanceAdminScreen'
import {
  AdminBalanceRequestDto,
  BalanceDecisionConflictError,
  DecideBalanceRequestResponse,
  GetAdminBalanceRequestsResponse
} from '@/shared/types/balance.types'
import { LoginData } from '@/shared/types/login.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const adminUserInfo: LoginData = {
  data: { user: { email: 'admin@kraft.test', name: 'Admin', lastName: 'User', role: ['admin'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const nonAdminUserInfo: LoginData = {
  data: { user: { email: 'user@kraft.test', name: 'Regular', lastName: 'User', role: ['user'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const buildAdminRequest = (overrides: Partial<AdminBalanceRequestDto> = {}): AdminBalanceRequestDto => ({
  id: '507f1f77bcf86cd799439011',
  amount: 31.45,
  paymentReference: null,
  status: 'pending',
  decisionReason: null,
  decisionAt: null,
  createdAt: '2026-07-18T12:00:00.000Z',
  updatedAt: '2026-07-18T12:00:00.000Z',
  userEmail: 'user@kraft.test',
  userName: 'Regular User',
  adminInCharge: null,
  ...overrides
})

const buildListResponse = (
  requests: AdminBalanceRequestDto[],
  overrides: Partial<GetAdminBalanceRequestsResponse['data']> = {}
): GetAdminBalanceRequestsResponse => ({
  version: '1.0',
  data: {
    requests,
    total: requests.length,
    page: 1,
    limit: 10,
    totalPages: 1,
    ...overrides
  },
  message: null,
  error: null
})

const findAmountText = (amount: string) =>
  screen.findByText((_, element) => Boolean(element && element.tagName === 'P' && element.textContent === amount))

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

const renderScreen = (userInfo: LoginData | null) => {
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <BalanceAdminScreen userInfo={userInfo} />
    </QueryClientProvider>
  )

  return queryClient
}

describe('BalanceAdminScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing and issues no admin request for a non-admin user', () => {
    renderScreen(nonAdminUserInfo)

    expect(screen.queryByText('Solicitudes de saldo')).not.toBeInTheDocument()
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('renders the queue for an admin user', async () => {
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)

    expect(await screen.findByRole('heading', { name: 'Solicitudes de saldo' })).toBeInTheDocument()
  })

  it('defaults the month select to the Mexico City calendar month when it differs from browser-local UTC', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-01T05:30:00.000Z'))
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)

    await screen.findByText(/no hay solicitudes pendientes/i)
    expect(screen.getByLabelText('Mes')).toHaveValue('1')
  })

  it('does not refetch until Aplicar filtros is pressed, then updates month/year/status and resets page', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)
    await screen.findByText(/no hay solicitudes pendientes/i)

    mockedAxios.get.mockClear()
    await user.selectOptions(screen.getByLabelText('Mes'), 'Agosto')
    await user.click(screen.getByRole('button', { name: 'Todas' }))
    expect(mockedAxios.get).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/balance/requests/admin',
        expect.objectContaining({ params: expect.objectContaining({ month: 8, page: 1, status: 'all' }) })
      )
    })
  })

  it('renders populated cards with amount, user info, status, dates, reference and admin-in-charge placeholders', async () => {
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request], { total: 4 }),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)

    expect(await findAmountText('$31.45 MXN')).toBeInTheDocument()
    expect(screen.getByText('Regular User')).toBeInTheDocument()
    expect(screen.getByText('user@kraft.test')).toBeInTheDocument()
    expect(screen.getByText('18 jul 2026')).toBeInTheDocument()
    expect(screen.getByText('Por asignar')).toBeInTheDocument()
    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    expect(screen.getByText(/4 solicitudes/i)).toBeInTheDocument()
  })

  it('renders a real payment reference and admin-in-charge value when present', async () => {
    const request = buildAdminRequest({
      status: 'approved',
      paymentReference: 'KRF-843210',
      adminInCharge: 'admin@kraft.test'
    })
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)

    await findAmountText('$31.45 MXN')
    expect(screen.getByText('KRF-843210')).toBeInTheDocument()
    expect(screen.getByText('admin@kraft.test')).toBeInTheDocument()
  })

  it('opens the detail drawer with the reused row data on Ver detalle', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')

    await user.click(screen.getByRole('button', { name: /ver detalle/i }))

    expect(await screen.findByRole('heading', { name: 'Detalle de solicitud' })).toBeInTheDocument()
    expect(screen.getByText(request.id)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aprobar solicitud' })).toBeInTheDocument()
  })

  it('shows read-only detail with no decision controls for a non-pending request', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest({ status: 'approved', decisionReason: null, adminInCharge: 'admin@kraft.test' })
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))

    await screen.findByRole('heading', { name: 'Detalle de solicitud' })
    expect(screen.queryByRole('button', { name: 'Aprobar solicitud' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rechazar solicitud' })).not.toBeInTheDocument()
  })

  it('disables Confirmar aprobación until Referencia de pago is non-empty and PATCHes the exact approve payload', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: { ...request, status: 'approved', paymentReference: 'KRF-1' } }, message: null, error: null },
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))
    await user.click(await screen.findByRole('button', { name: 'Aprobar solicitud' }))

    const confirmButton = screen.getByRole('button', { name: 'Confirmar aprobación' })
    expect(confirmButton).toBeDisabled()

    await user.type(screen.getByLabelText('Referencia de pago'), 'KRF-1')
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)

    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/balance/requests/507f1f77bcf86cd799439011/decision', {
        action: 'approve',
        paymentReference: 'KRF-1'
      })
    )
  })

  it('sends an omitted reason when the reject textarea is empty', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: { ...request, status: 'rejected' } }, message: null, error: null },
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))
    await user.click(await screen.findByRole('button', { name: 'Rechazar solicitud' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }))

    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/balance/requests/507f1f77bcf86cd799439011/decision', {
        action: 'reject'
      })
    )
  })

  it('sends the trimmed reason when the reject textarea has text', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: { ...request, status: 'rejected' } }, message: null, error: null },
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))
    await user.click(await screen.findByRole('button', { name: 'Rechazar solicitud' }))
    await user.type(screen.getByLabelText('Motivo (opcional)'), 'Comprobante inválido')
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }))

    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/balance/requests/507f1f77bcf86cd799439011/decision', {
        action: 'reject',
        reason: 'Comprobante inválido'
      })
    )
  })

  it('invalidates balance and requests queries and closes the drawer on a successful decision', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: { ...request, status: 'approved', paymentReference: 'KRF-1' } }, message: null, error: null },
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    const queryClient = renderScreen(adminUserInfo)
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))
    await user.click(await screen.findByRole('button', { name: 'Aprobar solicitud' }))
    await user.type(screen.getByLabelText('Referencia de pago'), 'KRF-1')
    await user.click(screen.getByRole('button', { name: 'Confirmar aprobación' }))

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance', 'requests'] }))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance'] })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Detalle de solicitud' })).not.toBeInTheDocument())
  })

  it('preserves state and shows the conflict alert on a flat 409 BAL-BUS-002 without a false decided state', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)
    mockedAxios.isAxiosError.mockReturnValue(true)
    const conflict: BalanceDecisionConflictError = {
      code: 'BAL-BUS-002',
      message: 'La solicitud de saldo no se encuentra en un estado válido para esta operación.',
      technicalDetails: null,
      statusCode: 409
    }
    mockedAxios.patch.mockRejectedValue({ response: { status: 409, data: conflict } })

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /ver detalle/i }))
    await user.click(await screen.findByRole('button', { name: 'Aprobar solicitud' }))
    await user.type(screen.getByLabelText('Referencia de pago'), 'KRF-1')
    await user.click(screen.getByRole('button', { name: 'Confirmar aprobación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/la solicitud ya cambió de estado/i)
    expect(screen.getByRole('heading', { name: 'Detalle de solicitud' })).toBeInTheDocument()
  })

  it('shows skeleton cards while loading, not real rows', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}))

    renderScreen(adminUserInfo)

    expect(screen.getByRole('status', { name: '' })).toBeInTheDocument()
  })

  it('shows the error state with a working Reintentar button', async () => {
    const user = userEvent.setup()
    let callCount = 0
    mockedAxios.get.mockImplementation(() => {
      callCount += 1
      return Promise.reject(new Error('Network error'))
    })

    renderScreen(adminUserInfo)

    expect(await screen.findByText(/no pudimos cargar las solicitudes de saldo/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(callCount).toBe(2))
  })

  it('shows mode-aware empty state copy for Pendientes vs Todas', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)
    expect(await screen.findByText('No hay solicitudes pendientes en este periodo.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Todas' }))
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(await screen.findByText('No hay solicitudes en este periodo.')).toBeInTheDocument()
  })

  it('changes page without resetting applied filters', async () => {
    const user = userEvent.setup()
    const request = buildAdminRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request], { totalPages: 3, page: 1 }),
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    renderScreen(adminUserInfo)
    await findAmountText('$31.45 MXN')

    mockedAxios.get.mockClear()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/balance/requests/admin',
        expect.objectContaining({ params: expect.objectContaining({ page: 2, status: 'pending' }) })
      )
    })
  })
})
