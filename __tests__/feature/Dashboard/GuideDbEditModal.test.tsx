import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { GuideDbEditModal } from '@/features/Dashboard/subscreens/GuideDbEditModal'
import { GuideDbRecord } from '@/shared/types/guides.types'
import { mockMatchMedia, QueryMatchMedia } from '../../utils-test/mockWatchMedia'

const guide: GuideDbRecord = {
  kraftId: 'KFT-1',
  quote: { id: 'quote-1', service: 'Servicio', total: 100, typeService: null, courier: null },
  status: 'failed',
  provider: 'Mn',
  isProviderTrackingSynced: false,
  failureInfo: null,
  origin: {
    alias: 'Casa', name: 'Juan Perez', lastName: 'Perez', phone: '5512345678', email: 'juan@example.com', company: 'Kraft Envios', street1: 'Calle Uno', external_number: '12', neighborhood: 'Centro', city: 'CDMX', town: 'Cuauhtemoc', state: 'CDMX', zipcode: '06000', country: 'MX', reference: 'Puerta azul',
  },
  destination: {
    alias: 'Oficina', name: 'Ana Lopez', lastName: 'Lopez', phone: '5587654321', email: 'ana@example.com', company: 'Kraft Envios', street1: 'Calle Dos', external_number: '34', neighborhood: 'Roma', city: 'CDMX', town: 'Cuauhtemoc', state: 'CDMX', zipcode: '06700', country: 'MX', reference: 'Recepcion',
  },
  parcel: { length: 20, width: 15, height: 10, weight: 2, content: 'Documentos', satProductId: 'SAT-1' },
  createdAt: '2026-07-17T00:00:00Z',
  updatedAt: '2026-07-17T00:00:00Z',
}

describe('GuideDbEditModal', () => {
  beforeEach(() => {
    mockMatchMedia({ [QueryMatchMedia.isDesktop]: true })
  })

  it('prefills the manual origin form for the selected guide', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <GuideDbEditModal open onClose={jest.fn()} guide={guide} />
      </QueryClientProvider>,
    )

    expect(await screen.findByTestId('street1')).toHaveValue('Calle Uno')
    expect(screen.getByTestId('alias')).toHaveValue('Casa')
    expect(screen.getByTestId('name')).toHaveValue('Juan')
  })
})
