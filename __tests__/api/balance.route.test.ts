import axios, { AxiosResponse } from 'axios'

import { GET, POST } from '@/app/api/balance/route'
import {
  CreateBalanceRequestErrorResponse,
  CreateBalanceRequestPayload,
  CreateBalanceRequestResponse,
  GetBalanceResponse
} from '@/shared/types/balance.types'
import { getAccessToken } from '../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/server', () => ({
  NextResponse: {
    json: (
      body:
        | Record<string, string>
        | GetBalanceResponse
        | CreateBalanceRequestResponse
        | CreateBalanceRequestErrorResponse,
      init?: ResponseInit
    ) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body)
    })
  }
}))
jest.mock('../../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn()
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>

const balanceResponse: GetBalanceResponse = {
  version: '1.0',
  data: {
    balance: {
      amount: 31.45
    }
  },
  message: null,
  error: null
}

const upstreamErrorResponse = {
  message: 'unauthorized'
}

const createRequestResponse: CreateBalanceRequestResponse = {
  version: '1.0',
  data: {
    request: {
      id: '507f1f77bcf86cd799439011',
      amount: 31.45,
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
}

const validationErrorResponse: CreateBalanceRequestErrorResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: {
    statusCode: 400,
    message: ['amount must not be greater than 100000'],
    error: 'Bad Request'
  }
}

const domainAuthErrorResponse: CreateBalanceRequestErrorResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: {
    code: 'BAL-AUTH-001',
    message: 'Authenticated user could not be identified'
  }
}

const createRequest = (body: CreateBalanceRequestPayload & { note?: string }): Request =>
  ({
    json: jest.fn().mockResolvedValue(body)
  }) as Pick<Request, 'json'> as Request

describe('GET /api/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('forwards the authenticated balance request and returns the upstream envelope', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.get.mockResolvedValue({
      data: balanceResponse,
      status: 200
    } as AxiosResponse<GetBalanceResponse>)

    const response = await GET()

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/balance', {
      headers: {
        Authorization: 'Bearer token-123'
      }
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(balanceResponse)
  })

  it('returns the established local missing-token response', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await GET()

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('preserves upstream error status and body when available', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: upstreamErrorResponse,
        status: 401
      }
    })

    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual(upstreamErrorResponse)
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValue(new Error('Connection failed'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to fetch balance' })
  })
})

describe('POST /api/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('forwards only the amount with bearer auth and preserves the upstream success envelope', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.post.mockResolvedValue({
      data: createRequestResponse,
      status: 201
    } as AxiosResponse<CreateBalanceRequestResponse>)

    const response = await POST(createRequest({ amount: 31.45, note: 'drop me' }))

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://backend.test/balance/requests',
      { amount: 31.45 },
      {
        headers: {
          Authorization: 'Bearer token-123'
        }
      }
    )
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual(createRequestResponse)
  })

  it('returns missing token without parsing or forwarding the body', async () => {
    mockedGetAccessToken.mockResolvedValue('')
    const request = createRequest({ amount: 31.45 })

    const response = await POST(request)

    expect(request.json).not.toHaveBeenCalled()
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('preserves upstream validation error status and body', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.post.mockRejectedValue({
      response: {
        data: validationErrorResponse,
        status: 400
      }
    })

    const response = await POST(createRequest({ amount: 100000.01 }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual(validationErrorResponse)
  })

  it('preserves upstream authentication error status and body', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.post.mockRejectedValue({
      response: {
        data: domainAuthErrorResponse,
        status: 401
      }
    })

    const response = await POST(createRequest({ amount: 31.45 }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual(domainAuthErrorResponse)
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.post.mockRejectedValue(new Error('Connection failed'))

    const response = await POST(createRequest({ amount: 31.45 }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to create balance request' })
  })
})
