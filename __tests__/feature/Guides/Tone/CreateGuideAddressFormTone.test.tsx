import { render, screen } from '@testing-library/react'
import { CreateGuideAddressFormTone } from '@/features/Guides/Tone/CreateGuideAddressFormTone'
import { CreateGuideAddressFormValuesTone } from '@/shared/types/guides.types'

// Mock functions for props
const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockToggleModal = jest.fn()
const mockUpdateAddress = jest.fn()

// Mock address data for testing
const mockAddressData: CreateGuideAddressFormValuesTone = {
  name: 'Juan',
  lastName: 'Pérez',
  street1: 'Av. Principal 123',
  neighborhood: 'Centro',
  town: 'Guadalajara',
  external_number: '123',
  state: 'Jalisco',
  phone: '5551234567',
  email: 'juan@example.com',
  reference: 'Entre calle A y B'
}

const defaultProps = {
  isDestination: false,
  addressData: mockAddressData,
  goNext: mockGoNext,
  goPrev: mockGoPrev,
  toggleModal: mockToggleModal,
  updateAddress: mockUpdateAddress
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<CreateGuideAddressFormTone {...mergedProps} />)
}

describe('CreateGuideAddressFormTone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering with address data', () => {
    it('should display all form fields with correct labels and default values from addressData prop', () => {
      // Given CreateGuideAddressFormTone is rendered with address data
      renderComponent()

      // Then all form fields should be present with correct labels
      expect(screen.getByLabelText('Nombre de la persona')).toBeInTheDocument()
      expect(screen.getByLabelText('Apellido de la persona')).toBeInTheDocument()
      expect(screen.getByLabelText('Calle')).toBeInTheDocument()
      expect(screen.getByLabelText('Colonia')).toBeInTheDocument()
      expect(screen.getByLabelText('Numero exterior')).toBeInTheDocument()
      expect(screen.getByLabelText('Municipio')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado de la República')).toBeInTheDocument()
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
      expect(screen.getByLabelText('Correo electrónico (Opcional)')).toBeInTheDocument()
      expect(screen.getByLabelText('Referencia del domicilio (Opcional)')).toBeInTheDocument()

      // Then all input fields should have correct default values
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Av. Principal 123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Centro')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Guadalajara')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Jalisco')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Entre calle A y B')).toBeInTheDocument()

      // Then action buttons should be present
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    })
  })
})
