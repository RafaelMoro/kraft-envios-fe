import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTempAddressTone } from '@/features/Guides/Tone/AddTempAddressTone'
import { AddressType, CreateGuideAddressFormValuesTone } from '@/shared/types/guides.types'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'

// Mock functions for props
const mockGoNext = jest.fn()
const mockToggleTempAddressModal = jest.fn()
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
  addressData: mockAddressData,
  addressType: 'origin' as AddressType,
  goNext: mockGoNext,
  toggleTempAddressModal: mockToggleTempAddressModal,
  updateAddress: mockUpdateAddress
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <QueryProviderWrapper>
      <AddTempAddressTone {...mergedProps} />
    </QueryProviderWrapper>
  )
}

describe('AddTempAddressTone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering with address data', () => {
    it('should display all form fields with correct labels and default values from addressData prop', () => {
      renderComponent()

      // Personal data section
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
      expect(screen.getByLabelText('Correo electrónico (Opcional)')).toBeInTheDocument()

      // Address section
      expect(screen.getByText('Domicilio')).toBeInTheDocument()
      expect(screen.getByLabelText('Calle')).toBeInTheDocument()
      expect(screen.getByLabelText('Numero exterior')).toBeInTheDocument()
      expect(screen.getByLabelText('Municipio')).toBeInTheDocument()
      expect(screen.getByLabelText('Referencia del domicilio (Opcional)')).toBeInTheDocument()

      // Verify default values
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Av. Principal 123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Guadalajara')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Entre calle A y B')).toBeInTheDocument()

      // Verify action buttons
      expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('should call toggleTempAddressModal when Volver button is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      const backButton = screen.getByRole('button', { name: 'Volver' })
      await user.click(backButton)

      expect(mockToggleTempAddressModal).toHaveBeenCalledTimes(1)
      expect(mockGoNext).not.toHaveBeenCalled()
      expect(mockUpdateAddress).not.toHaveBeenCalled()
    })

    it('should allow user to edit form fields', async () => {
      const user = userEvent.setup()
      renderComponent()

      const nameInput = screen.getByLabelText('Nombre')
      await user.clear(nameInput)
      await user.type(nameInput, 'Carlos')

      expect(screen.getByDisplayValue('Carlos')).toBeInTheDocument()
    })
  })

  describe('AddressRegionSelector integration', () => {
    it('should display AutocompleteZipcode component by default', () => {
      renderComponent()

      // AutocompleteZipcode component should render with zipcode field
      expect(screen.getByLabelText('Código Postal')).toBeInTheDocument()
    })
  })
})
