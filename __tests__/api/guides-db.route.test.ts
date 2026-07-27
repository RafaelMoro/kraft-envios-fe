/**
 * @jest-environment node
 */
import axios, { AxiosResponse } from 'axios'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/guides-db/route'
import { GetGuidesDbResponse } from '@/shared/types/guides.types'
import { getAccessToken } from '../../src/shared/lib/auth.lib'

jest.mock('axios')
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (
        body: Record<string, string> | GetGuidesDbResponse,
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

const upstreamResponse: GetGuidesDbResponse = {
  version: '1.0',
  message: null,
  error: null,
  data: {
    guides: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
}

const buildRequest = (query: string): NextRequest =>
  new NextRequest(`http://localhost/api/guides-db${query}`)

describe('GET /api/guides-db', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.BACKEND_URI = 'https://backend.test'
  })

  it('forwards own-list range params to /guides/db unchanged with bearer auth', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.get.mockResolvedValue({ data: upstreamResponse, status: 200 } as AxiosResponse<GetGuidesDbResponse>)

    const response = await GET(buildRequest('?page=1&startDate=2026-02-01T06:00:00.000Z&endDate=2026-02-02T06:00:00.000Z'))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/guides/db', {
      headers: { Authorization: 'Bearer token-123' },
      params: {
        page: '1',
        startDate: '2026-02-01T06:00:00.000Z',
        endDate: '2026-02-02T06:00:00.000Z',
      },
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(upstreamResponse)
  })

  it.each(['all', 'own'] as const)('forwards scope=%s range params to /guides/db/admin and preserves admin flags', async (scope) => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.get.mockResolvedValue({ data: upstreamResponse, status: 200 } as AxiosResponse<GetGuidesDbResponse>)

    const response = await GET(buildRequest(
      `?page=1&scope=${scope}&startDate=2026-02-01T06:00:00.000Z&endDate=2026-02-02T06:00:00.000Z&includeDeleted=true&includeInternalPricing=true`
    ))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/guides/db/admin', {
      headers: { Authorization: 'Bearer token-123' },
      params: {
        page: '1',
        scope,
        startDate: '2026-02-01T06:00:00.000Z',
        endDate: '2026-02-02T06:00:00.000Z',
        includeDeleted: 'true',
        includeInternalPricing: 'true',
      },
    })
    expect(response.status).toBe(200)
  })

  it('drops unrelated query keys via the allowlist', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.get.mockResolvedValue({ data: upstreamResponse, status: 200 } as AxiosResponse<GetGuidesDbResponse>)

    await GET(buildRequest('?page=1&month=7&year=2026&unrelatedKey=drop-me'))

    expect(mockedAxios.get).toHaveBeenCalledWith('https://backend.test/guides/db', {
      headers: { Authorization: 'Bearer token-123' },
      params: { page: '1', month: '7', year: '2026' },
    })
  })

  it('returns the upstream envelope and raw timestamp strings unchanged', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    const response: GetGuidesDbResponse = {
      ...upstreamResponse,
      data: {
        ...upstreamResponse.data,
        guides: [
          {
            kraftId: 'KFT-1',
            quote: { id: 'q1', service: 'Estandar', total: 100, typeService: 'standard', courier: null },
            status: 'created',
            provider: 'Mn',
            isProviderTrackingSynced: false,
            failureInfo: null,
            origin: {
              alias: 'Casa', name: 'Juan', lastName: 'Perez', phone: '5512345678', email: 'a@a.com',
              company: 'Kraft', street1: 'Calle', external_number: '1', neighborhood: 'Centro',
              city: 'CDMX', town: 'Cuauhtemoc', state: 'CDMX', zipcode: '06600', country: 'MX', reference: 'Ref',
            },
            destination: {
              alias: 'Casa', name: 'Juan', lastName: 'Perez', phone: '5512345678', email: 'a@a.com',
              company: 'Kraft', street1: 'Calle', external_number: '1', neighborhood: 'Centro',
              city: 'CDMX', town: 'Cuauhtemoc', state: 'CDMX', zipcode: '06600', country: 'MX', reference: 'Ref',
            },
            parcel: { length: 10, width: 10, height: 10, weight: 1, content: 'Caja', satProductId: 'SAT-1' },
            createdAt: '2026-02-01T06:00:00.000Z',
            updatedAt: '2026-02-01T06:00:00.000Z',
          },
        ],
      },
    }
    mockedAxios.get.mockResolvedValue({ data: response, status: 200 } as AxiosResponse<GetGuidesDbResponse>)

    const result = await GET(buildRequest('?page=1&month=7&year=2026'))

    await expect(result.json()).resolves.toEqual(response)
  })

  it('returns the established missing-token response without calling upstream', async () => {
    mockedGetAccessToken.mockResolvedValue('')

    const response = await GET(buildRequest('?page=1&month=7&year=2026'))

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'missing access token' })
  })

  it('preserves the existing error status/body behavior for upstream failures', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValue({
      response: { data: { error: { message: 'invalid range' } }, status: 400 },
      message: 'Request failed',
    })

    const response = await GET(buildRequest('?page=1&startDate=2026-02-01T06:00:00.000Z&endDate=2026-02-02T06:00:00.000Z'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'invalid range' })
  })
})
