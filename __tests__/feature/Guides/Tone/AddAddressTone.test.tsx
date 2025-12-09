import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AddAddressTone } from '@/features/Guides/Tone/AddAddressTone'
import { CreateGuideAddressFormValuesTone, AliasSavedTone } from '@/shared/types/guides.types'
import { Address } from '@/shared/types/addresses.types'

// Mock the useGetAddress hook
jest.mock('../../../../src/shared/hooks/useGetAddress', () => ({
  useGetAddress: jest.fn()
}))

import { useGetAddress } from '@/shared/hooks/useGetAddress'
const mockedUseGetAddress = useGetAddress as jest.MockedFunction<typeof useGetAddress>

// Mock functions for props
const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockToggleModal = jest.fn()
const mockUpdateAddress = jest.fn()
const mockUpdateSavedAlias = jest.fn()

const mockAddresses: Address[] = [
  {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '4',
    reference: 'Cerca del parque',
    zipcode: '12345',
    state: 'CDMX',
    city: ['Ciudad de México'],
    town: ['Cuauhtémoc'],
    alias: 'Casa',
    neighborhood: 'Centro'
  },
  {
    addressName: 'Avenida Reforma',
    externalNumber: '456',
    internalNumber: '2',
    reference: 'Frente al metro',
    zipcode: '54321',
    state: 'Nuevo León',
    city: ['Monterrey', 'San Pedro'],
    town: ['Centro', 'Norte'],
    alias: 'Oficina',
    neighborhood: 'Residencial'
  }
]

const emptyAliasSaved: AliasSavedTone = {
  alias: '',
  town: '',
  address: {
    addressName: '',
    externalNumber: '',
    internalNumber: '',
    reference: '',
    zipcode: '',
    state: '',
    city: [],
    town: [],
    alias: '',
    neighborhood: ''
  },
  addressTone: {
    street1: '',
    neighborhood: '',
    town: '',
    external_number: '',
    state: '',
    reference: ''
  }
}

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
  aliasSaved: emptyAliasSaved,
  isDestination: false,
  goNext: mockGoNext,
  goPrev: mockGoPrev,
  toggleModal: mockToggleModal,
  updateAddress: mockUpdateAddress,
  updateSavedAlias: mockUpdateSavedAlias
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <QueryProviderWrapper>
      <AddAddressTone {...mergedProps} />
    </QueryProviderWrapper>
  )
}

describe('Feature: Add Address for Tone Guide Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseGetAddress.mockReturnValue({
      data: mockAddresses,
      aliases: ['Casa', 'Oficina'],
      refetch: jest.fn(),
      isPending: false,
      isError: false
    })
  })

  describe('Scenario: Display form with personal data section', () => {
    it('Given the component renders, When displaying the form, Then it should show personal data fields with correct labels', () => {
      renderComponent()

      expect(screen.getByText('Datos personales')).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
      expect(screen.getByLabelText('Correo electrónico (Opcional)')).toBeInTheDocument()
    })

    it('Given the component renders, When displaying the form, Then it should populate personal data fields with default values', () => {
      renderComponent()

      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display address selection section', () => {
    it('Given the component renders, When displaying the form, Then it should show the address dropdown section', () => {
      renderComponent()

      expect(screen.getByText('Domicilio')).toBeInTheDocument()
      expect(screen.getByText(/selecciona una dirección o llene una dirección temporal/i)).toBeInTheDocument()
      expect(screen.getByTestId('select-address-dropdown-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display action buttons for origin address', () => {
    it('Given isDestination is false, When the component renders, Then it should display Cancelar button', () => {
      renderComponent({ isDestination: false })

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    })
  })

  describe('Scenario: Display action buttons for destination address', () => {
    it('Given isDestination is true, When the component renders, Then it should display Regresar button', () => {
      renderComponent({ isDestination: true })

      expect(screen.getByRole('button', { name: 'Regresar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    })
  })

  describe('Scenario: Toggle to temporary address form', () => {
    it('Given the component renders, When user clicks the temporary address button, Then it should display the temporary address form', async () => {
      const user = userEvent.setup()
      renderComponent()

      const tempAddressButton = screen.getByRole('button', { name: /usar dirección temporal/i })
      await user.click(tempAddressButton)

      expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
      expect(screen.queryByText(/selecciona una dirección o llene una dirección temporal/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Cancel from origin address form', () => {
    it('Given isDestination is false, When user clicks Cancelar button, Then it should call toggleModal', async () => {
      const user = userEvent.setup()
      renderComponent({ isDestination: false })

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      await user.click(cancelButton)

      expect(mockToggleModal).toHaveBeenCalled()
      expect(mockGoPrev).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Go back from destination address form', () => {
    it('Given isDestination is true, When user clicks Regresar button, Then it should call goPrev', async () => {
      const user = userEvent.setup()
      renderComponent({ isDestination: true })

      const backButton = screen.getByRole('button', { name: 'Regresar' })
      await user.click(backButton)

      expect(mockGoPrev).toHaveBeenCalled()
      expect(mockToggleModal).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form without selecting an alias', () => {
    it('Given no alias is selected, When user submits the form, Then it should display an error message', async () => {
      const user = userEvent.setup()
      renderComponent()

      const submitButton = screen.getByRole('button', { name: 'Siguiente' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Por favor selecciona un alias de dirección')).toBeInTheDocument()
      })
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form with valid data', () => {
    it('Given a valid alias is selected and form is filled, When user submits the form, Then it should call updateAddress and goNext', async () => {
      const user = userEvent.setup()
      
      const aliasSaved: AliasSavedTone = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        address: mockAddresses[0],
        addressTone: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          town: 'Cuauhtémoc',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }

      renderComponent({ aliasSaved })

      const submitButton = screen.getByRole('button', { name: 'Siguiente' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith({
          name: 'Juan',
          lastName: 'Pérez',
          phone: '5551234567',
          email: 'juan@example.com',
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          town: 'Cuauhtémoc',
          state: 'CDMX',
          reference: 'Cerca del parque'
        })
        expect(mockGoNext).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Submit form without town selected', () => {
    it('Given an alias is selected but town is empty, When user submits the form, Then it should display a town error', async () => {
      const user = userEvent.setup()
      
      const aliasSaved: AliasSavedTone = {
        alias: 'Casa',
        town: '',
        address: mockAddresses[0],
        addressTone: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          town: '',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }

      renderComponent({ aliasSaved })

      const submitButton = screen.getByRole('button', { name: 'Siguiente' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Por favor selecciona un municipio')).toBeInTheDocument()
      })
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Update address info when alias is selected', () => {
    it('Given addresses are loaded, When user selects an alias, Then it should call updateSavedAlias with correct data', async () => {
      const user = userEvent.setup()
      renderComponent()

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const casaOption = await screen.findByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        expect(mockUpdateSavedAlias).toHaveBeenCalledWith({
          alias: 'Casa',
          address: mockAddresses[0],
          addressTone: {
            street1: 'Calle Principal',
            external_number: '123',
            neighborhood: 'Centro',
            town: 'Cuauhtémoc',
            state: 'CDMX',
            reference: 'Cerca del parque'
          },
          town: 'Cuauhtémoc'
        })
      })
    })
  })

  describe('Scenario: Form validation for personal data', () => {
    it('Given invalid personal data, When user submits the form, Then it should display validation errors', async () => {
      const user = userEvent.setup()
      
      const invalidAddressData: CreateGuideAddressFormValuesTone = {
        ...mockAddressData,
        name: '',
        lastName: '',
        phone: ''
      }

      const aliasSaved: AliasSavedTone = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        address: mockAddresses[0],
        addressTone: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          town: 'Cuauhtémoc',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }

      renderComponent({ addressData: invalidAddressData, aliasSaved })

      const nameInput = screen.getByLabelText('Nombre')
      await user.clear(nameInput)

      const submitButton = screen.getByRole('button', { name: 'Siguiente' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockGoNext).not.toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Display temporary address button', () => {
    it('Given the component renders, When displaying the form, Then it should show the temporary address button', () => {
      renderComponent()

      expect(screen.getByRole('button', { name: /usar dirección temporal/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Saved alias is displayed on initialization', () => {
    it('Given an alias is saved, When the component renders, Then it should display the saved alias', () => {
      const aliasSaved: AliasSavedTone = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        address: mockAddresses[0],
        addressTone: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          town: 'Cuauhtémoc',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }

      renderComponent({ aliasSaved })

      expect(screen.getByText('Casa')).toBeInTheDocument()
    })
  })
})
