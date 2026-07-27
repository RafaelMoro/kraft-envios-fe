import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import axios, { AxiosResponse } from 'axios'

import { BalanceDisplay } from '@/features/Balance/BalanceDisplay'
import { BALANCE_API_ENDPOINT } from '@/shared/constants/global.constants'
import { GetBalanceResponse } from '@/shared/types/balance.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const positiveBalanceResponse: GetBalanceResponse = {
  version: '1.0',
  data: {
    balance: {
      amount: 31.45
    }
  },
  message: null,
  error: null
}

const zeroBalanceResponse: GetBalanceResponse = {
  version: '1.0',
  data: {
    balance: {
      amount: 0
    }
  },
  message: null,
  error: null
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

const renderBalanceDisplay = () => {
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <BalanceDisplay />
    </QueryClientProvider>
  )

  return queryClient
}

const mockBalanceResponse = (response: GetBalanceResponse) => {
  mockedAxios.get.mockResolvedValue({
    data: response,
    status: 200
  } as AxiosResponse<GetBalanceResponse>)
}

describe('BalanceDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows a compact loading status while the first request is pending', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}))

    renderBalanceDisplay()

    expect(screen.getByLabelText(/saldo disponible/i)).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent(/cargando saldo/i)
  })

  it('renders a positive MXN amount with currency context', async () => {
    mockBalanceResponse(positiveBalanceResponse)

    renderBalanceDisplay()

    expect(await screen.findByText('$31.45')).toBeInTheDocument()
    expect(screen.getByText(/monto disponible en mxn/i)).toBeInTheDocument()
    expect(mockedAxios.get).toHaveBeenCalledWith(BALANCE_API_ENDPOINT)
  })

  it('renders zero as an explicit MXN amount', async () => {
    mockBalanceResponse(zeroBalanceResponse)

    renderBalanceDisplay()

    expect(await screen.findByText('$0.00')).toBeInTheDocument()
  })

  it('shows compact error text after an initial failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'))

    renderBalanceDisplay()
    expect(await screen.findByText(/no disponible/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/no pudimos actualizar tu saldo/i)
  })

  it('restores the cached amount after a failed refetch', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: positiveBalanceResponse,
        status: 200
      } as AxiosResponse<GetBalanceResponse>)
      .mockRejectedValueOnce(new Error('Network error'))

    const queryClient = renderBalanceDisplay()
    expect(await screen.findByText('$31.45')).toBeInTheDocument()

    await queryClient.invalidateQueries({ queryKey: ['balance'] })

    await waitFor(() => {
      expect(screen.getByText('$31.45')).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(/no pudimos actualizar tu saldo/i)
    })
  })
})
