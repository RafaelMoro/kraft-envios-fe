import {
  CreateGuideDbAddressPayload,
  GuideDbRecord,
  SearchProduct,
} from '@/shared/types/guides.types'
import {
  buildUpdateGuideDbPayload,
  guideDbRecordToEditForm,
  toGuideDbAddressPayload,
} from '@/shared/utils/guides.utils'

const origin: CreateGuideDbAddressPayload = {
  alias: 'Origen',
  name: 'Juan Perez',
  lastName: 'Perez',
  phone: '5512345678',
  email: 'juan@example.com',
  company: 'Kraft Envios',
  street1: 'Calle Uno',
  external_number: '12',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtemoc',
  state: 'Ciudad de Mexico',
  zipcode: '06000',
  country: 'Mexico',
  reference: 'Puerta azul',
}

const guide: GuideDbRecord = {
  kraftId: 'KFT-1',
  quote: { id: 'quote-1', service: 'Servicio', total: 100, typeService: null, courier: null },
  status: 'failed',
  provider: 'Mn',
  isProviderTrackingSynced: false,
  failureInfo: null,
  origin,
  destination: { ...origin, alias: 'Destino', name: 'Ana Lopez', lastName: 'Lopez', country: 'MX' },
  parcel: {
    length: 20,
    width: 15,
    height: 10,
    weight: 2,
    content: 'Documentos',
    satProductId: 'SAT-1',
    value: 500,
    quantity: 2,
  },
  createdAt: '2026-07-17T00:00:00Z',
  updatedAt: '2026-07-17T00:00:00Z',
}

describe('Guides DB edit payload helpers', () => {
  it('prefills existing data without duplicating a full name and last name', () => {
    expect(guideDbRecordToEditForm(guide)).toEqual({
      formData: {
        originAddress: expect.objectContaining({ name: 'Juan', lastName: 'Perez' }),
        destinationAddress: expect.objectContaining({ name: 'Ana', lastName: 'Lopez' }),
        parcelInfo: { content: 'Documentos', value: '500', quantity: '2', notifyMe: false },
      },
      packageDimensions: { length: '20', width: '15', height: '10', weight: '2' },
      searchProductSat: 'SAT-1',
    })
  })

  it('builds complete address payloads with defaults and country', () => {
    const { originAddress } = guideDbRecordToEditForm(guide).formData

    expect(toGuideDbAddressPayload({ ...originAddress, email: '', company: '', reference: '' })).toEqual({
      ...origin,
      email: process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com',
      company: 'Kraft Envios',
      country: 'MX',
      reference: 'Sin referencia',
    })
  })

  it('omits unchanged sections', () => {
    expect(buildUpdateGuideDbPayload(guide, guideDbRecordToEditForm(guide).formData, null)).toEqual({})
  })

  it('includes a complete changed parcel and preserves original non-editable values', () => {
    const formData = guideDbRecordToEditForm(guide).formData
    formData.parcelInfo.content = 'Papeleria'

    expect(buildUpdateGuideDbPayload(guide, formData, null)).toEqual({
      parcel: { ...guide.parcel, content: 'Papeleria' },
    })
  })

  it('includes only changed address sections and uses a selected SAT product', () => {
    const formData = guideDbRecordToEditForm(guide).formData
    formData.originAddress.city = 'Toluca'
    formData.destinationAddress.street1 = 'Calle Dos'
    const product: SearchProduct = { code: 'SAT-2', description: 'Papeleria' }

    expect(buildUpdateGuideDbPayload(guide, formData, product)).toEqual({
      origin: { ...origin, city: 'Toluca' },
      destination: { ...guide.destination, street1: 'Calle Dos' },
      parcel: { ...guide.parcel, satProductId: 'SAT-2' },
    })
  })
})
