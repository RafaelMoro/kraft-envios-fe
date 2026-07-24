import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosResponse } from 'axios'

import { BalanceAdminRequestDetail } from '@/features/Balance/BalanceAdminRequestDetail'
import { BALANCE_REQUESTS_ADMIN_API_ENDPOINT } from '@/shared/constants/global.constants'
import { AdminBalanceRequestDto, GetAdminBalanceRequestResponse } from '@/shared/types/balance.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const REQUEST_ID = '507f1f77bcf86cd799439011'
const DETAIL_URL = `${BALANCE_REQUESTS_ADMIN_API_ENDPOINT}/${REQUEST_ID}`

const buildRequest = (overrides: Partial<AdminBalanceRequestDto> = {}): AdminBalanceRequestDto => ({
  id: REQUEST_ID,
  amount: 31.45,
  paymentReference: null,
  status: 'pending',
  decisionReason: null,
  decisionAt: null,
  createdAt: '2026-02-01T05:59:59.999Z',
  updatedAt: '2026-02-01T05:59:59.999Z',
  userEmail: 'user@kraft.test',
  userName: 'Regular User',
  adminInCharge: null,
  ...overrides
})

const buildDetailResponse = (request: AdminBalanceRequestDto): GetAdminBalanceRequestResponse => ({
  version: '1.0',
  data: { request },
  message: null,
  error: null
})

/** Routes axios.get by URL, and lets the detail response vary per call to prove the post-decision refetch. */
const mockAxiosGetSequence = (responses: AdminBalanceRequestDto[]) => {
  let callIndex = 0
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === DETAIL_URL) {
      const request = responses[Math.min(callIndex, responses.length - 1)]
      callIndex += 1
      return Promise.resolve({ data: buildDetailResponse(request), status: 200 } as AxiosResponse<GetAdminBalanceRequestResponse>)
    }
    return Promise.reject(new Error(`unexpected axios.get url: ${url}`))
  })
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

const renderDetail = (requestId: string = REQUEST_ID) => {
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <BalanceAdminRequestDetail requestId={requestId} />
    </QueryClientProvider>
  )

  return queryClient
}

describe('BalanceAdminRequestDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows a loading status with no fabricated fields', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}))

    renderDetail()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('$31.45')).not.toBeInTheDocument()
  })

  it('renders a pending request with fields, timezone-correct timestamps, and decision controls', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-01T12:00:00.000Z'))
    mockAxiosGetSequence([buildRequest()])

    renderDetail()

    expect(await screen.findByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText(REQUEST_ID)).toBeInTheDocument()
    expect(screen.getByText('Regular User')).toBeInTheDocument()
    expect(screen.getByText('user@kraft.test')).toBeInTheDocument()
    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    // 2026-02-01T05:59:59.999Z is still January in America/Mexico_City.
    expect(screen.getAllByText(/31 ene 2026/i)).toHaveLength(2)
    expect(screen.getByRole('button', { name: /aprobar solicitud/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rechazar solicitud/i })).toBeInTheDocument()
  })

  it('renders an approved request read-only with its payment reference and deciding admin', async () => {
    mockAxiosGetSequence([
      buildRequest({
        status: 'approved',
        paymentReference: 'KRF-843210',
        adminInCharge: 'admin@kraft.test',
        decisionAt: '2026-07-23T12:00:00.000Z'
      })
    ])

    renderDetail()

    expect(await screen.findByText('Aprobada')).toBeInTheDocument()
    expect(screen.getByText('KRF-843210')).toBeInTheDocument()
    expect(screen.getByText('admin@kraft.test')).toBeInTheDocument()
    expect(screen.getByText(/esta solicitud ya fue decidida/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /aprobar solicitud/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /rechazar solicitud/i })).not.toBeInTheDocument()
  })

  it('renders a rejected request read-only with its decision reason', async () => {
    mockAxiosGetSequence([
      buildRequest({ status: 'rejected', decisionReason: 'Comprobante inválido', decisionAt: '2026-07-23T12:00:00.000Z' })
    ])

    renderDetail()

    expect(await screen.findByText('Rechazada')).toBeInTheDocument()
    expect(screen.getByText('Comprobante inválido')).toBeInTheDocument()
  })

  it('renders a cancelled request with no assigned admin, no decision-reason row, and no controls', async () => {
    mockAxiosGetSequence([buildRequest({ status: 'cancelled', decisionReason: null, adminInCharge: null })])

    renderDetail()

    expect(await screen.findByText('Cancelada')).toBeInTheDocument()
    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
    expect(screen.queryByText(/razón de la cancelación/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /aprobar solicitud/i })).not.toBeInTheDocument()
  })

  it('renders the not-found state for a 404, with no Reintentar button', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 404, data: { code: 'BAL_NF_001', message: 'not found', technicalDetails: null, statusCode: 404 } }
    })

    renderDetail('unknown-id')

    expect(await screen.findByText(/solicitud no encontrada/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument()
  })

  it('renders the not-found state for a malformed id, same as an unknown id', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 404, data: { code: 'BAL_NF_001', message: 'not found', technicalDetails: null, statusCode: 404 } }
    })

    renderDetail('abc')

    expect(await screen.findByText(/solicitud no encontrada/i)).toBeInTheDocument()
  })

  it('renders the generic error state for a non-404 failure, and Reintentar refetches', async () => {
    const user = userEvent.setup()
    let callCount = 0
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockImplementation(() => {
      callCount += 1
      return Promise.reject(new Error('Network error'))
    })

    renderDetail()

    expect(await screen.findByText(/no pudimos cargar la solicitud/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(callCount).toBe(2))
  })

  it('shows the success panel after approving, and Ver solicitud actualizada reveals the refetched decided detail', async () => {
    const user = userEvent.setup()
    const pending = buildRequest()
    const approved = buildRequest({
      status: 'approved',
      paymentReference: 'KRF-843210',
      adminInCharge: 'admin@kraft.test',
      decisionAt: '2026-07-23T12:00:00.000Z'
    })
    mockAxiosGetSequence([pending, approved])
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: approved }, message: null, error: null },
      status: 200
    } as AxiosResponse)

    renderDetail()

    await screen.findByText('Pendiente')
    await user.click(screen.getByRole('button', { name: /aprobar solicitud/i }))
    await user.type(screen.getByLabelText(/referencia de pago/i), 'KRF-843210')
    await user.click(screen.getByRole('button', { name: /confirmar aprobación/i }))

    expect(await screen.findByText(/decisión registrada/i)).toBeInTheDocument()
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ver solicitud actualizada/i }))

    expect(await screen.findByText('Aprobada')).toBeInTheDocument()
    expect(screen.getByText('KRF-843210')).toBeInTheDocument()
    expect(screen.queryByText(/decisión registrada/i)).not.toBeInTheDocument()
  })

  it('shows the conflict message on a flat 409 BAL-BUS-002 and never reaches the success panel', async () => {
    const user = userEvent.setup()
    mockAxiosGetSequence([buildRequest()])
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.patch.mockRejectedValue({
      response: {
        status: 409,
        data: {
          code: 'BAL-BUS-002',
          message: 'La solicitud de saldo no se encuentra en un estado válido para esta operación.',
          technicalDetails: null,
          statusCode: 409
        }
      }
    })

    renderDetail()

    await screen.findByText('Pendiente')
    await user.click(screen.getByRole('button', { name: /aprobar solicitud/i }))
    await user.type(screen.getByLabelText(/referencia de pago/i), 'KRF-843210')
    await user.click(screen.getByRole('button', { name: /confirmar aprobación/i }))

    expect(await screen.findByRole('alert', { name: '' })).toHaveTextContent(/ya cambió de estado/i)
    expect(screen.queryByText(/decisión registrada/i)).not.toBeInTheDocument()
  })

  it('invalidates the request lists and current balance after a decision', async () => {
    const user = userEvent.setup()
    const pending = buildRequest()
    const approved = buildRequest({ status: 'approved', paymentReference: 'KRF-843210' })
    mockAxiosGetSequence([pending, approved])
    mockedAxios.patch.mockResolvedValue({
      data: { version: '1.0', data: { request: approved }, message: null, error: null },
      status: 200
    } as AxiosResponse)

    const queryClient = createQueryClient()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    render(
      <QueryClientProvider client={queryClient}>
        <BalanceAdminRequestDetail requestId={REQUEST_ID} />
      </QueryClientProvider>
    )

    await screen.findByText('Pendiente')
    await user.click(screen.getByRole('button', { name: /aprobar solicitud/i }))
    await user.type(screen.getByLabelText(/referencia de pago/i), 'KRF-843210')
    await user.click(screen.getByRole('button', { name: /confirmar aprobación/i }))

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance', 'requests'] }))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance'] })
  })

  it('shows Volver al panel pointing at /dashboard in every state', async () => {
    mockAxiosGetSequence([buildRequest()])

    renderDetail()

    expect(screen.getAllByRole('link', { name: /volver al panel/i })[0]).toHaveAttribute('href', '/dashboard')
    await screen.findByText('Pendiente')
    expect(screen.getAllByRole('link', { name: /volver al panel/i })[0]).toHaveAttribute('href', '/dashboard')
  })
})
