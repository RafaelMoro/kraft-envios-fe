import axios, { AxiosResponse } from 'axios'

import {
  CreateGuideDbAddressPayload,
  CreateGuideDbParcelPayload,
  UpdateGuideDbPayload,
  UpdateGuideDbResponse,
} from '@/shared/types/guides.types'
import { updateGuideDbCb } from '@/shared/utils/guides.utils'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const parcel: CreateGuideDbParcelPayload = {
  length: 50,
  width: 40,
  height: 30,
  weight: 2,
  content: 'Caja',
  satProductId: 'SAT-001',
}

const address: CreateGuideDbAddressPayload = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Perez',
  phone: '5512345678',
  email: 'juan@example.com',
  company: 'Kraft Envios',
  street1: 'Av. Principal',
  external_number: '123',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtemoc',
  state: 'Ciudad de Mexico',
  zipcode: '06600',
  country: 'Mexico',
  reference: 'Frente al parque',
}

const response: UpdateGuideDbResponse = {
  version: '1.0',
  message: null,
  error: null,
  data: {
    kraftId: 'KFT-202607-000001',
    externalId: null,
    shipmentNumber: null,
    status: 'failed',
    provider: 'Mn',
    carrier: null,
    price: null,
    guideLink: null,
    isProviderTrackingSynced: false,
    labelUrl: null,
    file: null,
    createdAt: '2026-07-13T10:00:00Z',
    updatedAt: '2026-07-13T10:00:00Z',
    deletedAt: null,
    deletedBy: null,
    failureInfo: null,
  },
}

describe('updateGuideDbCb', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each<UpdateGuideDbPayload>([
    { parcel },
    { origin: address },
    { destination: address },
    { parcel, origin: address, destination: address },
  ])('sends a complete edited object payload to the encoded BFF URL', async (data) => {
    mockedAxios.patch.mockResolvedValue({ data: response } as AxiosResponse<UpdateGuideDbResponse>)

    await expect(updateGuideDbCb('KFT/2026 07', data)).resolves.toEqual(response.data)

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/api/guides-db/KFT%2F2026%2007',
      data,
    )
  })

  it('propagates Axios failures unchanged', async () => {
    const error = new Error('Network down')
    mockedAxios.patch.mockRejectedValue(error)

    await expect(updateGuideDbCb('KFT-1', { parcel })).rejects.toBe(error)
  })

  it('rejects an empty payload without calling Axios', async () => {
    await expect(updateGuideDbCb('KFT-1', {})).rejects.toThrow(
      'At least one editable object is required',
    )

    expect(mockedAxios.patch).not.toHaveBeenCalled()
  })
})
