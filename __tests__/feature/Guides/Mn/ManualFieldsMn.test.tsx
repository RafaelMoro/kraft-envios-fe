import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManualFieldsMn } from '@/features/Guides/Mn/ManualFieldsMn'
import { CreateGuideAddressFormValuesMn } from '@/shared/types/guides.types'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

const mockRegister = jest.fn() as unknown as UseFormRegister<CreateGuideAddressFormValuesMn>

const mockAddressData: CreateGuideAddressFormValuesMn = {
  name: 'John',
  lastName: 'Doe',
  street1: 'Main Street',
  neighborhood: 'Downtown',
  external_number: '123',
  city: 'Mexico City',
  company: 'ACME Corp',
  state: 'CDMX',
  phone: '5551234567',
  email: 'john@example.com',
  reference: 'Near the park'
}

const defaultProps = {
  addressData: mockAddressData,
  errors: {} as FieldErrors<CreateGuideAddressFormValuesMn>,
  register: mockRegister
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ManualFieldsMn {...mergedProps} />)
}

describe('ManualFieldsMn', () => {
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
      expect(screen.getByLabelText('Ciudad')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado de la República')).toBeInTheDocument()
    })

    it('should display fields with correct test ids', () => {
      renderComponent()

      expect(screen.getByTestId('neighborhood')).toBeInTheDocument()
      expect(screen.getByTestId('city')).toBeInTheDocument()
      expect(screen.getByTestId('state')).toBeInTheDocument()
    })

    it('should display fields with correct default values from addressData', () => {
      renderComponent()

      expect(screen.getByDisplayValue('Downtown')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Mexico City')).toBeInTheDocument()
      expect(screen.getByDisplayValue('CDMX')).toBeInTheDocument()
    })

    it('should render neighborhood field with correct attributes', () => {
      renderComponent()

      const neighborhoodInput = screen.getByTestId('neighborhood')
      expect(neighborhoodInput).toHaveAttribute('id', 'neighborhood')
      expect(neighborhoodInput).toHaveAttribute('type', 'text')
    })

    it('should render city field with correct attributes', () => {
      renderComponent()

      const cityInput = screen.getByTestId('city')
      expect(cityInput).toHaveAttribute('id', 'city')
      expect(cityInput).toHaveAttribute('type', 'text')
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
      const errors: FieldErrors<CreateGuideAddressFormValuesMn> = {
        neighborhood: {
          type: 'required',
          message: 'Colonia es requerida'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Colonia es requerida')).toBeInTheDocument()
    })

    it('should display error message for city when error exists', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesMn> = {
        city: {
          type: 'required',
          message: 'Ciudad es requerida'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Ciudad es requerida')).toBeInTheDocument()
    })

    it('should display error message for state when error exists', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesMn> = {
        state: {
          type: 'required',
          message: 'Estado es requerido'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Estado es requerido')).toBeInTheDocument()
    })

    it('should display multiple error messages when multiple errors exist', () => {
      const errors: FieldErrors<CreateGuideAddressFormValuesMn> = {
        neighborhood: {
          type: 'required',
          message: 'Colonia es requerida'
        },
        city: {
          type: 'required',
          message: 'Ciudad es requerida'
        },
        state: {
          type: 'required',
          message: 'Estado es requerido'
        }
      }

      renderComponent({ errors })

      expect(screen.getByText('Colonia es requerida')).toBeInTheDocument()
      expect(screen.getByText('Ciudad es requerida')).toBeInTheDocument()
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

    it('should allow user to type in city field', async () => {
      const user = userEvent.setup()
      renderComponent({
        addressData: { ...mockAddressData, city: '' }
      })

      const cityInput = screen.getByTestId('city')
      await user.type(cityInput, 'Guadalajara')

      expect(cityInput).toHaveValue('Guadalajara')
    })

    it('should allow user to type in state field', async () => {
      const user = userEvent.setup()
      renderComponent({
        addressData: { ...mockAddressData, state: '' }
      })

      const stateInput = screen.getByTestId('state')
      await user.type(stateInput, 'Jalisco')

      expect(stateInput).toHaveValue('Jalisco')
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

    it('should allow user to clear and update all fields', async () => {
      const user = userEvent.setup()
      renderComponent()

      const neighborhoodInput = screen.getByTestId('neighborhood')
      const cityInput = screen.getByTestId('city')
      const stateInput = screen.getByTestId('state')

      await user.clear(neighborhoodInput)
      await user.type(neighborhoodInput, 'New Hood')

      await user.clear(cityInput)
      await user.type(cityInput, 'New City')

      await user.clear(stateInput)
      await user.type(stateInput, 'New State')

      expect(neighborhoodInput).toHaveValue('New Hood')
      expect(cityInput).toHaveValue('New City')
      expect(stateInput).toHaveValue('New State')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string values in addressData', () => {
      const emptyAddressData: CreateGuideAddressFormValuesMn = {
        name: '',
        lastName: '',
        street1: '',
        neighborhood: '',
        external_number: '',
        city: '',
        company: '',
        state: '',
        phone: '',
        email: '',
        reference: ''
      }

      renderComponent({ addressData: emptyAddressData })

      expect(screen.getByTestId('neighborhood')).toHaveValue('')
      expect(screen.getByTestId('city')).toHaveValue('')
      expect(screen.getByTestId('state')).toHaveValue('')
    })

    it('should handle long text values in fields', () => {
      const longAddressData: CreateGuideAddressFormValuesMn = {
        ...mockAddressData,
        neighborhood: 'This is a very long neighborhood name that exceeds normal length',
        city: 'This is a very long city name that exceeds normal length',
        state: 'This is a very long state name'
      }

      renderComponent({ addressData: longAddressData })

      expect(screen.getByDisplayValue('This is a very long neighborhood name that exceeds normal length')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is a very long city name that exceeds normal length')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is a very long state name')).toBeInTheDocument()
    })

    it('should handle special characters in field values', () => {
      const specialCharAddressData: CreateGuideAddressFormValuesMn = {
        ...mockAddressData,
        neighborhood: 'Colonia #1 & 2',
        city: 'Ciudad "México"',
        state: "Estado's Name"
      }

      renderComponent({ addressData: specialCharAddressData })

      expect(screen.getByDisplayValue('Colonia #1 & 2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Ciudad "México"')).toBeInTheDocument()
      expect(screen.getByDisplayValue("Estado's Name")).toBeInTheDocument()
    })
  })

  describe('React Hook Form integration', () => {
    it('should call register for each field', () => {
      renderComponent()

      expect(mockRegister).toHaveBeenCalledWith('neighborhood')
      expect(mockRegister).toHaveBeenCalledWith('city')
      expect(mockRegister).toHaveBeenCalledWith('state')
    })
  })
})
