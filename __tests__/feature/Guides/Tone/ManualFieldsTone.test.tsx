import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManualFieldsTone } from '@/features/Guides/Tone/ManualFieldsTone'
import { CreateGuideAddressFormValuesTone } from '@/shared/types/guides.types'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

const mockRegister = jest.fn() as unknown as UseFormRegister<CreateGuideAddressFormValuesTone>

const mockAddressData: CreateGuideAddressFormValuesTone = {
  name: 'John',
  lastName: 'Doe',
  street1: 'Main Street',
  neighborhood: 'Downtown',
  town: 'Guadalajara',
  external_number: '123',
  state: 'Jalisco',
  phone: '5551234567',
  email: 'john@example.com',
  reference: 'Near the park'
}

const defaultProps = {
  addressData: mockAddressData,
  errors: {} as FieldErrors<CreateGuideAddressFormValuesTone>,
  register: mockRegister
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ManualFieldsTone {...mergedProps} />)
}

describe('ManualFieldsTone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRegister.mockImplementation((name) => ({
      name,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn()
    }))
  })

  describe('Form field rendering', () => {
    it('should display all form fields with correct labels', () => {
      renderComponent()

      expect(screen.getByLabelText('Colonia')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado de la República')).toBeInTheDocument()
    })

    it('should display fields with correct test ids', () => {
      renderComponent()

      expect(screen.getByTestId('neighborhood')).toBeInTheDocument()
      expect(screen.getByTestId('state')).toBeInTheDocument()
    })

    it('should display fields with correct default values from addressData', () => {
      renderComponent()

      expect(screen.getByDisplayValue('Downtown')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Jalisco')).toBeInTheDocument()
    })

    it('should render neighborhood field with correct attributes', () => {
      renderComponent()

      const neighborhoodInput = screen.getByTestId('neighborhood')
      expect(neighborhoodInput).toHaveAttribute('id', 'neighborhood')
      expect(neighborhoodInput).toHaveAttribute('type', 'text')
    })

    it('should render state field with correct attributes', () => {
      renderComponent()

      const stateInput = screen.getByTestId('state')
      expect(stateInput).toHaveAttribute('id', 'state')
      expect(stateInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Error message display', () => {
    it('should display error message for neighborhood when error exists', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesTone> = {
        neighborhood: {
          type: 'required',
          message: 'Colonia es requerida'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Colonia es requerida')).toBeInTheDocument()
    })

    it('should display error message for state when error exists', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesTone> = {
        state: {
          type: 'required',
          message: 'Estado es requerido'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Estado es requerido')).toBeInTheDocument()
    })

    it('should display multiple error messages when multiple errors exist', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesTone> = {
        neighborhood: {
          type: 'required',
          message: 'Colonia es requerida'
        },
        state: {
          type: 'required',
          message: 'Estado es requerido'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Colonia es requerida')).toBeInTheDocument()
      expect(screen.getByText('Estado es requerido')).toBeInTheDocument()
    })

    it('should not display error messages when no errors exist', () => {
      renderComponent()

      expect(screen.queryByText(/es requerida/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/es requerido/i)).not.toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('should allow user to type in neighborhood field', async () => {
      const user = userEvent.setup()
      renderComponent({
        addressData: { ...mockAddressData, neighborhood: '' }
      })

      const neighborhoodInput = screen.getByTestId('neighborhood')
      await user.type(neighborhoodInput, 'Uptown')

      expect(neighborhoodInput).toHaveValue('Uptown')
    })

    it('should allow user to type in state field', async () => {
      const user = userEvent.setup()
      renderComponent({
        addressData: { ...mockAddressData, state: '' }
      })

      const stateInput = screen.getByTestId('state')
      await user.type(stateInput, 'CDMX')

      expect(stateInput).toHaveValue('CDMX')
    })

    it('should allow user to clear and update neighborhood field', async () => {
      const user = userEvent.setup()
      renderComponent()

      const neighborhoodInput = screen.getByTestId('neighborhood')
      expect(neighborhoodInput).toHaveValue('Downtown')

      await user.clear(neighborhoodInput)
      await user.type(neighborhoodInput, 'New Neighborhood')

      expect(neighborhoodInput).toHaveValue('New Neighborhood')
    })

    it('should allow user to clear and update state field', async () => {
      const user = userEvent.setup()
      renderComponent()

      const stateInput = screen.getByTestId('state')
      expect(stateInput).toHaveValue('Jalisco')

      await user.clear(stateInput)
      await user.type(stateInput, 'Nuevo León')

      expect(stateInput).toHaveValue('Nuevo León')
    })

    it('should allow user to clear and update all fields', async () => {
      const user = userEvent.setup()
      renderComponent()

      const neighborhoodInput = screen.getByTestId('neighborhood')
      const stateInput = screen.getByTestId('state')

      await user.clear(neighborhoodInput)
      await user.type(neighborhoodInput, 'New Hood')

      await user.clear(stateInput)
      await user.type(stateInput, 'New State')

      expect(neighborhoodInput).toHaveValue('New Hood')
      expect(stateInput).toHaveValue('New State')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string values in addressData', () => {
      const emptyAddressData: CreateGuideAddressFormValuesTone = {
        name: '',
        lastName: '',
        street1: '',
        neighborhood: '',
        town: '',
        external_number: '',
        state: '',
        phone: '',
        email: '',
        reference: ''
      }

      renderComponent({ addressData: emptyAddressData })

      expect(screen.getByTestId('neighborhood')).toHaveValue('')
      expect(screen.getByTestId('state')).toHaveValue('')
    })

    it('should handle long text values in fields', () => {
      const longAddressData: CreateGuideAddressFormValuesTone = {
        ...mockAddressData,
        neighborhood: 'This is a very long neighborhood name that exceeds normal length',
        state: 'This is a very long state name that exceeds normal length'
      }

      renderComponent({ addressData: longAddressData })

      expect(screen.getByDisplayValue('This is a very long neighborhood name that exceeds normal length')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is a very long state name that exceeds normal length')).toBeInTheDocument()
    })

    it('should handle special characters in field values', () => {
      const specialCharAddressData: CreateGuideAddressFormValuesTone = {
        ...mockAddressData,
        neighborhood: 'Colonia #1 & 2',
        state: "Estado's Name"
      }

      renderComponent({ addressData: specialCharAddressData })

      expect(screen.getByDisplayValue('Colonia #1 & 2')).toBeInTheDocument()
      expect(screen.getByDisplayValue("Estado's Name")).toBeInTheDocument()
    })

    it('should handle accented characters in field values', () => {
      const accentedAddressData: CreateGuideAddressFormValuesTone = {
        ...mockAddressData,
        neighborhood: 'Colón',
        state: 'México'
      }

      renderComponent({ addressData: accentedAddressData })

      expect(screen.getByDisplayValue('Colón')).toBeInTheDocument()
      expect(screen.getByDisplayValue('México')).toBeInTheDocument()
    })
  })

  describe('React Hook Form integration', () => {
    it('should call register for each field', () => {
      renderComponent()

      expect(mockRegister).toHaveBeenCalledWith('neighborhood')
      expect(mockRegister).toHaveBeenCalledWith('state')
    })

    it('should call register exactly twice for the two fields', () => {
      renderComponent()

      expect(mockRegister).toHaveBeenCalledTimes(2)
    })
  })
})
