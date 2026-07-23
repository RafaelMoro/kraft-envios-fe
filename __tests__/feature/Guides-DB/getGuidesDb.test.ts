import axios, { AxiosResponse } from 'axios'

import { getGuidesDbCb } from '@/shared/utils/guides.utils'
import { GetGuidesDbResponse } from '@/shared/types/guides.types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const emptyResponse: GetGuidesDbResponse = {
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

describe('getGuidesDbCb', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: emptyResponse } as AxiosResponse<GetGuidesDbResponse>)
  })

  it('serializes month mode with only integer month/year and no range fields', async () => {
    await getGuidesDbCb({ page: 1, month: 7, year: 2026 })

    const [uri] = mockedAxios.get.mock.calls[0]
    const searchParams = new URLSearchParams(uri.split('?')[1])

    expect(searchParams.get('month')).toBe('7')
    expect(searchParams.get('year')).toBe('2026')
    expect(searchParams.has('startDate')).toBe(false)
    expect(searchParams.has('endDate')).toBe(false)
  })

  it('serializes range mode with only complete instants and no month/year', async () => {
    await getGuidesDbCb({
      page: 1,
      startDate: '2026-02-01T06:00:00.000Z',
      endDate: '2026-02-02T06:00:00.000Z',
    })

    const [uri] = mockedAxios.get.mock.calls[0]
    const searchParams = new URLSearchParams(uri.split('?')[1])

    expect(searchParams.get('startDate')).toBe('2026-02-01T06:00:00.000Z')
    expect(searchParams.get('endDate')).toBe('2026-02-02T06:00:00.000Z')
    expect(searchParams.has('month')).toBe(false)
    expect(searchParams.has('year')).toBe(false)
  })

  it('encodes a positive-offset range boundary with %2B', async () => {
    await getGuidesDbCb({
      page: 1,
      startDate: '2026-02-01T00:00:00.000+06:00',
      endDate: '2026-02-02T00:00:00.000+06:00',
    })

    const [uri] = mockedAxios.get.mock.calls[0]

    expect(uri).toContain('%2B06%3A00')
  })

  it('preserves existing optional pagination/admin field serialization', async () => {
    await getGuidesDbCb({
      page: 2,
      month: 7,
      year: 2026,
      limit: 50,
      scope: 'own',
      includeDeleted: true,
      includeInternalPricing: true,
    })

    const [uri] = mockedAxios.get.mock.calls[0]
    const searchParams = new URLSearchParams(uri.split('?')[1])

    expect(searchParams.get('page')).toBe('2')
    expect(searchParams.get('limit')).toBe('50')
    expect(searchParams.get('scope')).toBe('own')
    expect(searchParams.get('includeDeleted')).toBe('true')
    expect(searchParams.get('includeInternalPricing')).toBe('true')
  })

  it('omits limit when it is the default 10', async () => {
    await getGuidesDbCb({ page: 1, month: 7, year: 2026, limit: 10 })

    const [uri] = mockedAxios.get.mock.calls[0]
    const searchParams = new URLSearchParams(uri.split('?')[1])

    expect(searchParams.has('limit')).toBe(false)
  })

  it('returns the upstream response records unchanged, including raw timestamp strings', async () => {
    const response: GetGuidesDbResponse = {
      ...emptyResponse,
      data: {
        ...emptyResponse.data,
        guides: [
          {
            kraftId: 'KFT-1',
            quote: {
              id: 'q1',
              service: 'Estandar',
              total: 100,
              typeService: 'standard',
              courier: null,
            },
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
            parcel: {
              length: 10, width: 10, height: 10, weight: 1, content: 'Caja', satProductId: 'SAT-1',
            },
            createdAt: '2026-02-01T06:00:00.000Z',
            updatedAt: '2026-02-01T06:00:00.000Z',
          },
        ],
      },
    }
    mockedAxios.get.mockResolvedValue({ data: response } as AxiosResponse<GetGuidesDbResponse>)

    const result = await getGuidesDbCb({ page: 1, month: 7, year: 2026 })

    expect(result.guides[0].createdAt).toBe('2026-02-01T06:00:00.000Z')
    expect(result.guides[0].updatedAt).toBe('2026-02-01T06:00:00.000Z')
  })
})
