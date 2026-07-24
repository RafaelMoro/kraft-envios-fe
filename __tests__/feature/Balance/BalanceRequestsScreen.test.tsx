import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosResponse } from 'axios'

import { BalanceRequestsScreen } from '@/features/Balance/BalanceRequestsScreen'
import { BalanceRequestDto, CancelBalanceRequestResponse, GetBalanceRequestsResponse } from '@/shared/types/balance.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const buildRequest = (overrides: Partial<BalanceRequestDto> = {}): BalanceRequestDto => ({
  id: '507f1f77bcf86cd799439011',
  amount: 31.45,
  paymentReference: null,
  status: 'pending',
  decisionReason: null,
  decisionAt: null,
  createdAt: '2026-07-18T12:00:00.000Z',
  updatedAt: '2026-07-18T12:00:00.000Z',
  ...overrides
})

const buildListResponse = (
  requests: BalanceRequestDto[],
  overrides: Partial<GetBalanceRequestsResponse['data']> = {}
): GetBalanceRequestsResponse => ({
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

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

const renderScreen = () => {
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <BalanceRequestsScreen />
    </QueryClientProvider>
  )

  return queryClient
}

describe('BalanceRequestsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('defaults the month select to the Mexico City calendar month when it differs from browser-local UTC', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-01T05:30:00.000Z'))
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()

    await screen.findByText(/no tienes solicitudes todavía/i)
    expect(screen.getByLabelText('Mes')).toHaveValue('1')
  })

  it('renders populated rows with amount, status, dates, total count, payment reference, and decision reason', async () => {
    const request = buildRequest({
      status: 'cancelled',
      paymentReference: 'REF-123',
      decisionReason: 'Pago no confirmado',
      decisionAt: '2026-07-20T12:00:00.000Z'
    })
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request], { total: 6 }),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()

    expect(await screen.findByText('$31.45 MXN')).toBeInTheDocument()
    expect(screen.getByText('Cancelada')).toBeInTheDocument()
    expect(screen.getByText('18 jul 2026')).toBeInTheDocument()
    expect(screen.getByText('20 jul 2026')).toBeInTheDocument()
    expect(screen.getByText('REF-123')).toBeInTheDocument()
    expect(screen.getByText('Pago no confirmado')).toBeInTheDocument()
    expect(screen.getByText(/6 solicitudes/i)).toBeInTheDocument()
  })

  it('omits payment reference and decision reason rows when absent, and shows the pending label with no decision date', async () => {
    const request = buildRequest({ paymentReference: null, decisionReason: null })
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([request]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()

    await screen.findByText('$31.45 MXN')
    expect(screen.queryByText(/referencia de pago/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/razón de la cancelación/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Pendiente')).toHaveLength(2)
  })

  it('shows Cancelar only for pending requests', async () => {
    const pending = buildRequest({ id: 'pending-1', status: 'pending', amount: 31.45 })
    const approved = buildRequest({ id: 'approved-1', status: 'approved', amount: 99.99, decisionAt: '2026-07-20T12:00:00.000Z' })
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([pending, approved]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()

    await screen.findByText('$99.99 MXN')
    expect(screen.getAllByRole('button', { name: /cancelar/i })).toHaveLength(1)
  })

  it('requires confirmation before calling the cancel callback', async () => {
    const user = userEvent.setup()
    const pending = buildRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([pending]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()
    await screen.findByText('$31.45 MXN')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(await screen.findByText(/seguro que quieres cancelar/i)).toBeInTheDocument()
    expect(mockedAxios.patch).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /sí, cancelar/i }))
    await waitFor(() => expect(mockedAxios.patch).toHaveBeenCalledTimes(1))
  })

  it('reflects cancelled status via invalidation on success without touching the balance query', async () => {
    const user = userEvent.setup()
    const pending = buildRequest()
    const cancelled: BalanceRequestDto = { ...pending, status: 'cancelled', decisionAt: '2026-07-23T12:00:00.000Z' }

    mockedAxios.get
      .mockResolvedValueOnce({ data: buildListResponse([pending]), status: 200 } as AxiosResponse<GetBalanceRequestsResponse>)
      .mockResolvedValueOnce({ data: buildListResponse([cancelled]), status: 200 } as AxiosResponse<GetBalanceRequestsResponse>)

    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: cancelled }, message: null, error: null },
      status: 200
    } as AxiosResponse<CancelBalanceRequestResponse>)

    const queryClient = renderScreen()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    await screen.findByText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    await user.click(await screen.findByRole('button', { name: /sí, cancelar/i }))

    await waitFor(() => expect(screen.getByText('Cancelada')).toBeInTheDocument())
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance', 'requests'] })
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['balance'] })
  })

  it('preserves prior state and shows an error on a 409 conflict', async () => {
    const user = userEvent.setup()
    const pending = buildRequest()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([pending]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.patch.mockRejectedValue({
      response: {
        status: 409,
        data: { version: '1.0', data: null, message: null, error: { code: 'BAL-BUS-002', message: 'Not pending' } }
      }
    })

    renderScreen()
    await screen.findByText('$31.45 MXN')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    await user.click(await screen.findByRole('button', { name: /sí, cancelar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cancelar la solicitud/i)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
  })

  it('shows skeleton cards while loading, not real rows', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}))

    renderScreen()

    expect(screen.getByRole('status', { name: '' })).toBeInTheDocument()
    expect(screen.queryByText('$31.45 MXN')).not.toBeInTheDocument()
  })

  it('shows the error state with a Reintentar button that refetches, keeping filters mounted', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockRejectedValue(new Error('Network error'))

    renderScreen()

    expect(await screen.findByText(/no pudimos cargar tus solicitudes de saldo/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Mes')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(2))
  })

  it('shows the empty state with a working Crear solicitud CTA and keeps filters mounted', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse([]),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()

    expect(await screen.findByText(/no tienes solicitudes todavía/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Mes')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /crear solicitud/i }))
    expect(await screen.findByRole('heading', { name: /solicitar saldo/i })).toBeInTheDocument()
  })

  it('resets the page to 1 when the month changes', async () => {
    const user = userEvent.setup()
    const requests = Array.from({ length: 1 }, () => buildRequest())
    mockedAxios.get.mockResolvedValue({
      data: buildListResponse(requests, { totalPages: 3, page: 2 }),
      status: 200
    } as AxiosResponse<GetBalanceRequestsResponse>)

    renderScreen()
    await screen.findByText('$31.45 MXN')

    mockedAxios.get.mockClear()
    await user.selectOptions(screen.getByLabelText('Mes'), 'Agosto')

    await waitFor(() => {
      const lastCall = mockedAxios.get.mock.calls.at(-1)
      expect(lastCall?.[1]).toMatchObject({ params: expect.objectContaining({ page: 1, month: 8 }) })
    })
  })
})
