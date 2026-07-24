/**
 * @jest-environment node
 */
import axios, { AxiosResponse } from 'axios'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/balance/requests/admin/[requestId]/route'
import {
  BalanceRequestNotFoundError,
  GetAdminBalanceRequestResponse
} from '@/shared/types/balance.types'
import { LoginData } from '@/shared/types/login.types'
import { getAccessToken, getUserInfo } from '../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (
        body:
          | Record<string, string>
          | GetAdminBalanceRequestResponse
          | BalanceRequestNotFoundError
          | { version: string; data: null; message: null; error: { message: string; statusCode: number } },
        init?: ResponseInit
      ) => ({
        status: init?.status ?? 200,
        json: () => Promise.resolve(body)
      })
    }
  }
})
jest.mock('../../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn(),
  getUserInfo: jest.fn()
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>
const mockedGetUserInfo = getUserInfo as jest.MockedFunction<typeof getUserInfo>

const buildRequest = (): NextRequest =>
  new NextRequest('http://localhost/api/balance/requests/admin/req-1')

const buildContext = (requestId: string) => ({ params: { requestId } })

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

const detailResponse: GetAdminBalanceRequestResponse = {
  version: '1.0',
  data: {
    request: {
      id: '507f1f77bcf86cd799439011',
      amount: 31.45,
      paymentReference: 'KRF-843210',
      status: 'pending',
      decisionReason: null,
      decisionAt: null,
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z',
      userEmail: 'user@kraft.test',
      userName: 'Regular User',
      adminInCharge: null
    }
  },
  message: null,
  error: null
}

const notFoundResponse: BalanceRequestNotFoundError = {
  code: 'BAL_NF_001',
  message: 'No se encontro la solicitud de saldo.',
  technicalDetails: null,
  statusCode: 404
}

const forbiddenResponse = {
  version: '1.0',
  data: null,
  message: null,
  error: { message: 'Forbidden', statusCode: 403 }
}

describe('GET /api/balance/requests/admin/[requestId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('GETs the encoded requestId with bearer auth and returns the upstream body/status', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.get.mockResolvedValue({
      data: detailResponse,
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestResponse>)

    const response = await GET(buildRequest(), buildContext('req/with space'))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/balance/requests/admin/req%2Fwith%20space', {
      headers: { Authorization: 'Bearer token-123' }
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(detailResponse)
  })

  it('returns the established local missing-token response without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('returns 403 for a non-admin caller without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(nonAdminUserInfo)

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'admin only' })
  })

  it('returns 403 when the user-info cookie is missing', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(null)

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'admin only' })
  })

  it('preserves the flat 404 BAL_NF_001 status and body verbatim', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: notFoundResponse,
        status: 404
      }
    })

    const response = await GET(buildRequest(), buildContext('unknown-id'))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual(notFoundResponse)
  })

  it('preserves the enveloped 403 Forbidden status and body verbatim', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: forbiddenResponse,
        status: 403
      }
    })

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual(forbiddenResponse)
  })

  it('preserves a 401 status and body verbatim', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: { message: 'Unauthorized' },
        status: 401
      }
    })

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' })
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValue(new Error('Connection failed'))

    const response = await GET(buildRequest(), buildContext('req-1'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to fetch admin balance request' })
  })
})
