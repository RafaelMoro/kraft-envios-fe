import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { BalanceRequestDialog } from '@/features/Balance/BalanceRequestDialog'
import {
  CreateBalanceRequestErrorResponse,
  CreateBalanceRequestResponse
} from '@/shared/types/balance.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const createResponse = (amount: number): CreateBalanceRequestResponse => ({
  version: '1.0',
  data: {
    request: {
      id: '507f1f77bcf86cd799439011',
      amount,
      paymentReference: null,
      status: 'pending',
      decisionReason: null,
      decisionAt: null,
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z'
    }
  },
  message: null,
  error: null
})

const validationErrorResponse: CreateBalanceRequestErrorResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: {
    statusCode: 400,
    message: ['amount must not be greater than 100000', 'amount must be a number'],
    error: 'Bad Request'
  }
}

const domainErrorResponse: CreateBalanceRequestErrorResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: {
    code: 'BAL-AUTH-001',
    message: 'No se pudo identificar al usuario',
    technicalDetails: { token: 'hidden' }
  }
}

const localErrorResponse: CreateBalanceRequestErrorResponse = {
  message: 'missing access token'
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

const renderDialog = () => {
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <BalanceRequestDialog />
    </QueryClientProvider>
  )

  return queryClient
}

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /solicitar saldo/i }))
  await screen.findByRole('dialog', { name: /solicitar saldo/i })

  return screen.getByLabelText(/monto a solicitar/i)
}

const fillAmount = async (user: ReturnType<typeof userEvent.setup>, input: HTMLElement, amount: string) => {
  await user.click(input)
  const inputElement = input as HTMLInputElement
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  valueSetter?.call(inputElement, amount)
  inputElement.dispatchEvent(new Event('input', { bubbles: true }))
}

const submitAmount = async (user: ReturnType<typeof userEvent.setup>, amount: string) => {
  const input = await openDialog(user)

  await fillAmount(user, input, amount)
  await waitFor(() => {
    expect(input).toHaveValue(amount)
  })
  await user.click(screen.getByRole('button', { name: /enviar solicitud/i }))

  return input
}

const mockCreateSuccess = (amount: number) => {
  mockedAxios.post.mockResolvedValue({
    data: createResponse(amount),
    status: 201
  } as AxiosResponse<CreateBalanceRequestResponse>)
}

const createAxiosError = (
  response?: CreateBalanceRequestErrorResponse
): AxiosError<CreateBalanceRequestErrorResponse> => ({
  name: 'AxiosError',
  message: 'Request failed',
  isAxiosError: true,
  toJSON: () => ({}),
  response: response
    ? ({
        data: response,
        status: 400
      } as AxiosResponse<CreateBalanceRequestErrorResponse>)
    : undefined
}) as AxiosError<CreateBalanceRequestErrorResponse>

describe('BalanceRequestDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['0.01', 0.01],
    ['100000.00', 100000]
  ])('submits boundary amount %s as a numeric payload', async (amountText, amount) => {
    const user = userEvent.setup()
    mockCreateSuccess(amount)

    renderDialog()
    await submitAmount(user, amountText)

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/balance', { amount })
    })
  })

  it.each(['', 'abc', '0', '-1', '100000.01', '1.159', '1,50', '1e2', '.01'])(
    'keeps invalid amount "%s" client-side',
    async (amount) => {
      const user = userEvent.setup()

      renderDialog()
      const input = await openDialog(user)

      if (amount) {
        await fillAmount(user, input, amount)
      }
      await user.click(screen.getByRole('button', { name: /enviar solicitud/i }))

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAccessibleDescription(/monto|decimales/i)
      })
      expect(mockedAxios.post).not.toHaveBeenCalled()
    }
  )

  it('disables submit while pending and allows the same amount after settlement', async () => {
    const user = userEvent.setup()
    let resolvePost: (value: AxiosResponse<CreateBalanceRequestResponse>) => void = () => undefined
    mockedAxios.post.mockReturnValueOnce(
      new Promise<AxiosResponse<CreateBalanceRequestResponse>>((resolve) => {
        resolvePost = resolve
      })
    )
    mockedAxios.post.mockResolvedValueOnce({
      data: createResponse(31.45),
      status: 201
    } as AxiosResponse<CreateBalanceRequestResponse>)

    renderDialog()
    await submitAmount(user, '31.45')

    const submitButton = screen.getByRole('button', { name: /enviando solicitud de saldo/i })
    expect(submitButton).toBeDisabled()
    await user.click(submitButton)
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)

    resolvePost({
      data: createResponse(31.45),
      status: 201
    } as AxiosResponse<CreateBalanceRequestResponse>)

    expect(await screen.findByText(/solicitud recibida/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    })
  })

  it('shows approved success copy and invalidates only the request-history prefix', async () => {
    const user = userEvent.setup()
    mockCreateSuccess(31.45)
    const queryClient = renderDialog()
    queryClient.setQueryData(['balance'], 500)
    queryClient.setQueryData(['balance', 'requests', { page: 1 }], [])
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    await submitAmount(user, '31.45')

    expect(await screen.findByText(/solicitud recibida/i)).toBeInTheDocument()
    expect(screen.getByText(/\$31\.45 MXN/i)).toBeInTheDocument()
    expect(screen.getByText(/verificaremos que se refleje en nuestra cuenta bancaria/i)).toBeInTheDocument()
    expect(screen.getByText(/un administrador aprobará la solicitud/i)).toBeInTheDocument()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['balance', 'requests'] })
    expect(queryClient.getQueryData(['balance'])).toBe(500)
  })

  it.each([
    [validationErrorResponse, /amount must not be greater than 100000/],
    [domainErrorResponse, /no se pudo identificar al usuario/i],
    [localErrorResponse, /missing access token/i]
  ])('shows safe server error copy without success or invalidation', async (response, message) => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValue(createAxiosError(response))
    const queryClient = renderDialog()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const input = await submitAmount(user, '31.45')

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(input).toHaveValue('31.45')
    expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('shows the stable fallback for transport errors', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValue(createAxiosError())

    renderDialog()
    await submitAmount(user, '31.45')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos crear la solicitud de saldo/i)
    expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument()
  })
})
