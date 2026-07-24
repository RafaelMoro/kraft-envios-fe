/**
 * @jest-environment node
 */
import axios, { AxiosResponse } from 'axios'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/balance/requests/route'
import { PATCH } from '@/app/api/balance/requests/[requestId]/cancel/route'
import { CancelBalanceRequestResponse, GetBalanceRequestsResponse } from '@/shared/types/balance.types'
import { getAccessToken } from '../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (
        body: Record<string, string> | GetBalanceRequestsResponse | CancelBalanceRequestResponse,
        init?: ResponseInit
      ) => ({
        status: init?.status ?? 200,
        json: () => Promise.resolve(body)
      })
    }
  }
})
jest.mock('../../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn()
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>

const buildRequest = (query: string): NextRequest =>
  new NextRequest(`http://localhost/api/balance/requests${query}`)

const listResponse: GetBalanceRequestsResponse = {
  version: '1.0',
  data: {
    requests: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  message: null,
  error: null
}

const cancelResponse: CancelBalanceRequestResponse = {
  version: '1.0',
  data: {
    request: {
      id: '507f1f77bcf86cd799439011',
      amount: 31.45,
      paymentReference: null,
      status: 'cancelled',
      decisionReason: null,
      decisionAt: '2026-07-23T12:00:00.000Z',
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-23T12:00:00.000Z'
    }
  },
  message: null,
  error: null
}

const conflictResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: {
    code: 'BAL-BUS-002',
    message: 'The balance request is not pending'
  }
}

describe('GET /api/balance/requests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('forwards only the allowlisted month/year/page/limit params with bearer auth', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.get.mockResolvedValue({ data: listResponse, status: 200 } as AxiosResponse<GetBalanceRequestsResponse>)

    const response = await GET(buildRequest('?month=7&year=2026&page=1&limit=10&status=pending'))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/balance/requests', {
      headers: { Authorization: 'Bearer token-123' },
      params: { month: '7', year: '2026', page: '1', limit: '10' }
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(listResponse)
  })

  it('returns the established local missing-token response without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await GET(buildRequest(''))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('preserves upstream error status and body when available', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: { message: 'unauthorized' },
        status: 401
      }
    })

    const response = await GET(buildRequest(''))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ message: 'unauthorized' })
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValue(new Error('Connection failed'))

    const response = await GET(buildRequest(''))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to fetch balance requests' })
  })
})

describe('PATCH /api/balance/requests/[requestId]/cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  const buildContext = (requestId: string) => ({ params: { requestId } })

  it('PATCHes the encoded requestId with no body and bearer auth', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.patch.mockResolvedValue({ data: cancelResponse, status: 200 } as AxiosResponse<CancelBalanceRequestResponse>)

    const response = await PATCH(buildRequest(''), buildContext('req/with space'))

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      'https://backend.test/balance/requests/req%2Fwith%20space/cancel',
      undefined,
      { headers: { Authorization: 'Bearer token-123' } }
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(cancelResponse)
  })

  it('returns the established local missing-token response without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await PATCH(buildRequest(''), buildContext('req-1'))

    expect(mockedAxios.patch).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('preserves the 409 BAL-BUS-002 conflict status and body', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.patch.mockRejectedValue({
      response: {
        data: conflictResponse,
        status: 409
      }
    })

    const response = await PATCH(buildRequest(''), buildContext('req-1'))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual(conflictResponse)
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.patch.mockRejectedValue(new Error('Connection failed'))

    const response = await PATCH(buildRequest(''), buildContext('req-1'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to cancel balance request' })
  })
})
