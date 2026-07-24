/**
 * @jest-environment node
 */
import axios, { AxiosResponse } from 'axios'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/balance/requests/admin/route'
import { PATCH } from '@/app/api/balance/requests/[requestId]/decision/route'
import {
  BalanceDecisionConflictError,
  DecideBalanceRequestResponse,
  GetAdminBalanceRequestsResponse
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
          | GetAdminBalanceRequestsResponse
          | DecideBalanceRequestResponse
          | BalanceDecisionConflictError,
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

const buildRequest = (query: string): NextRequest =>
  new NextRequest(`http://localhost/api/balance/requests/admin${query}`)

const buildPatchRequest = (body: unknown): NextRequest =>
  new NextRequest('http://localhost/api/balance/requests/req-1/decision', {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

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

const listResponse: GetAdminBalanceRequestsResponse = {
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

const decideResponse: DecideBalanceRequestResponse = {
  version: '1.0',
  data: {
    request: {
      id: '507f1f77bcf86cd799439011',
      amount: 31.45,
      paymentReference: 'KRF-843210',
      status: 'approved',
      decisionReason: null,
      decisionAt: '2026-07-23T12:00:00.000Z',
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-23T12:00:00.000Z',
      userEmail: 'user@kraft.test',
      userName: 'Regular User',
      adminInCharge: 'admin@kraft.test'
    }
  },
  message: null,
  error: null
}

const conflictResponse: BalanceDecisionConflictError = {
  code: 'BAL-BUS-002',
  message: 'La solicitud de saldo no se encuentra en un estado válido para esta operación.',
  technicalDetails: null,
  statusCode: 409
}

describe('GET /api/balance/requests/admin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('forwards only the allowlisted month/year/page/limit/status params with bearer auth', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.get.mockResolvedValue({
      data: listResponse,
      status: 200
    } as AxiosResponse<GetAdminBalanceRequestsResponse>)

    const response = await GET(buildRequest('?month=7&year=2026&page=1&limit=10&status=pending&userId=abc'))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/balance/requests/admin', {
      headers: { Authorization: 'Bearer token-123' },
      params: { month: '7', year: '2026', page: '1', limit: '10', status: 'pending' }
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

  it('returns 403 for a non-admin caller without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(nonAdminUserInfo)

    const response = await GET(buildRequest(''))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'admin only' })
  })

  it('preserves upstream error status and body when available', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: {
        data: { message: 'not found' },
        status: 404
      }
    })

    const response = await GET(buildRequest(''))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ message: 'not found' })
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValue(new Error('Connection failed'))

    const response = await GET(buildRequest(''))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to fetch admin balance requests' })
  })
})

describe('PATCH /api/balance/requests/[requestId]/decision', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  const buildContext = (requestId: string) => ({ params: { requestId } })

  it('PATCHes the encoded requestId with the approve body and bearer auth', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.patch.mockResolvedValue({
      data: decideResponse,
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    const response = await PATCH(
      buildPatchRequest({ action: 'approve', paymentReference: 'KRF-843210' }),
      buildContext('req/with space')
    )

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      'https://backend.test/balance/requests/req%2Fwith%20space/decision',
      { action: 'approve', paymentReference: 'KRF-843210' },
      { headers: { Authorization: 'Bearer token-123' } }
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(decideResponse)
  })

  it('omits reason from the reject body when empty', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.patch.mockResolvedValue({
      data: decideResponse,
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    await PATCH(buildPatchRequest({ action: 'reject' }), buildContext('req-1'))

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      'https://backend.test/balance/requests/req-1/decision',
      { action: 'reject' },
      { headers: { Authorization: 'Bearer token-123' } }
    )
  })

  it('includes reason in the reject body when provided', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.patch.mockResolvedValue({
      data: decideResponse,
      status: 200
    } as AxiosResponse<DecideBalanceRequestResponse>)

    await PATCH(buildPatchRequest({ action: 'reject', reason: 'Comprobante inválido' }), buildContext('req-1'))

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      'https://backend.test/balance/requests/req-1/decision',
      { action: 'reject', reason: 'Comprobante inválido' },
      { headers: { Authorization: 'Bearer token-123' } }
    )
  })

  it('returns the established local missing-token response without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await PATCH(buildPatchRequest({ action: 'reject' }), buildContext('req-1'))

    expect(mockedAxios.patch).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('returns 403 for a non-admin caller without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(nonAdminUserInfo)

    const response = await PATCH(buildPatchRequest({ action: 'reject' }), buildContext('req-1'))

    expect(mockedAxios.patch).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'admin only' })
  })

  it('preserves the flat 409 BAL-BUS-002 conflict status and body verbatim', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.patch.mockRejectedValue({
      response: {
        data: conflictResponse,
        status: 409
      }
    })

    const response = await PATCH(
      buildPatchRequest({ action: 'approve', paymentReference: 'KRF-843210' }),
      buildContext('req-1')
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual(conflictResponse)
  })

  it('returns a compact server error for transport failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.patch.mockRejectedValue(new Error('Connection failed'))

    const response = await PATCH(buildPatchRequest({ action: 'reject' }), buildContext('req-1'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Failed to decide balance request' })
  })
})
