import axios, { AxiosResponse } from 'axios'

import { GET } from '@/app/api/balance/route'
import { GetBalanceResponse } from '@/shared/types/balance.types'
import { getAccessToken } from '../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: Record<string, string> | GetBalanceResponse, init?: ResponseInit) => ({
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
})
