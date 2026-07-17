import { render, screen } from '@testing-library/react'

import { ConfirmGuideDbEditData } from '@/features/Guides-DB/ConfirmGuideDbEditData'
import { CreateGuideAddressFormValuesMn, CreateGuideDbFormValues } from '@/shared/types/guides.types'

const address: CreateGuideAddressFormValuesMn = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Perez',
  phone: '5512345678',
  email: 'juan@example.com',
  company: 'Kraft Envios',
  street1: 'Calle Uno',
  external_number: '12',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtemoc',
  state: 'CDMX',
  zipcode: '01000',
  reference: 'Puerta azul',
}

const parcelInfo: CreateGuideDbFormValues['parcelInfo'] = {
  content: 'Documentos',
  value: '',
  quantity: '',
  notifyMe: false,
}

const props = {
  originAddress: address,
  destinationAddress: { ...address, alias: 'Oficina' },
  parcelInfo,
  satProductLabel: 'Papeleria',
  isDeleted: false,
  isPending: false,
  noChangesDismissed: false,
  dismissNoChanges: jest.fn(),
  goPrev: jest.fn(),
  onSubmit: jest.fn(),
}

describe('ConfirmGuideDbEditData', () => {
  it('shows the no-changes message and disables editing without dirty sections', () => {
    render(<ConfirmGuideDbEditData {...props} changedSections={[]} />)

    expect(screen.getByText('Para continuar, modifica al menos un dato de la guía.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled()
  })

  it('shows the changed parcel summary and enables editing', () => {
    render(<ConfirmGuideDbEditData {...props} changedSections={['parcel']} />)

    expect(screen.getByText('Paquete')).toBeInTheDocument()
    expect(screen.getByText(/Descripción: Documentos/)).toBeInTheDocument()
    expect(screen.getByText(/Tipo de producto: Papeleria/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeEnabled()
  })
})
