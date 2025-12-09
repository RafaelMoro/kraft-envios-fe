import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AddAddressMn } from '@/features/Guides/Mn/AddAddressMn'
import { CreateGuideAddressFormValuesMn, AliasSavedMn } from '@/shared/types/guides.types'
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

const emptyAliasSaved: AliasSavedMn = {
  alias: '',
  town: '',
  city: '',
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
  addressMn: {
    street1: '',
    neighborhood: '',
    external_number: '',
    city: '',
    state: '',
    reference: ''
  }
}

const mockAddressData: CreateGuideAddressFormValuesMn = {
  name: 'Juan',
  lastName: 'Pérez',
  street1: 'Av. Principal 123',
  neighborhood: 'Centro',
  external_number: '123',
  city: 'Ciudad de México',
  state: 'CDMX',
  phone: '5551234567',
  email: 'juan@example.com',
  company: 'Mi Empresa',
  reference: 'Entre calle A y B'
}

const defaultProps = {
  title: 'Domicilio origen',
  addressData: mockAddressData,
  aliasSaved: emptyAliasSaved,
  isMobileTablet: false,
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
      <AddAddressMn {...mergedProps} />
    </QueryProviderWrapper>
  )
}

describe('Feature: Add Address for Mn Guide Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseGetAddress.mockReturnValue({
      data: mockAddresses,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn()
    } as any)
  })

  describe('Scenario: Display form with personal data fields', () => {
    it('Given the component renders, When displaying the form, Then it should show personal data fields with default values', () => {
      // Given the component renders
      renderComponent()

      // Then it should show personal data fields
      expect(screen.getByTestId('name')).toHaveValue(mockAddressData.name)
      expect(screen.getByLabelText(/apellido/i)).toHaveValue(mockAddressData.lastName)
      expect(screen.getByLabelText(/teléfono/i)).toHaveValue(mockAddressData.phone)
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(mockAddressData.email)
      expect(screen.getByTestId('company')).toHaveValue(mockAddressData.company)
    })
  })

  describe('Scenario: Display action buttons for origin address', () => {
    it('Given isDestination is false, When the component renders, Then it should display Cancelar button with red outline', () => {
      // Given isDestination is false
      renderComponent({ isDestination: false })

      // Then it should display Cancelar button
      const cancelButton = screen.getByTestId('origin-address-mn-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Cancelar')
    })

    it('Given isDestination is false, When the component renders, Then it should display Siguiente button', () => {
      // Given isDestination is false
      renderComponent({ isDestination: false })

      // Then it should display Siguiente button
      const nextButton = screen.getByTestId('origin-address-mn-next-button')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveTextContent('Siguiente')
    })
  })

  describe('Scenario: Display action buttons for destination address', () => {
    it('Given isDestination is true, When the component renders, Then it should display Regresar button', () => {
      // Given isDestination is true
      renderComponent({ isDestination: true })

      // Then it should display Regresar button
      const cancelButton = screen.getByTestId('destination-address-mn-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Regresar')
    })

    it('Given isDestination is true, When the component renders, Then it should display Siguiente button', () => {
      // Given isDestination is true
      renderComponent({ isDestination: true })

      // Then it should display Siguiente button
      const nextButton = screen.getByTestId('destination-address-mn-next-button')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveTextContent('Siguiente')
    })
  })

  describe('Scenario: Toggle to temporary address form', () => {
    it('Given the component renders, When user clicks the temporary address button, Then it should display the temporary address form', async () => {
      // Given the component renders
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the temporary address button
      const tempAddressButton = screen.getByText('Usar dirección temporal')
      await user.click(tempAddressButton)

      // Then it should display the temporary address form (AddTempAddressMn)
      await waitFor(() => {
        expect(screen.getByText('Datos personales')).toBeInTheDocument()
        expect(screen.getByText('Volver')).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Cancel from origin address form', () => {
    it('Given isDestination is false, When user clicks Cancelar button, Then it should call toggleModal', async () => {
      // Given isDestination is false
      const user = userEvent.setup()
      renderComponent({ isDestination: false })

      // When user clicks Cancelar button
      const cancelButton = screen.getByTestId('origin-address-mn-cancel-button')
      await user.click(cancelButton)

      // Then it should call toggleModal
      expect(mockToggleModal).toHaveBeenCalledTimes(1)
      expect(mockGoPrev).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Go back from destination address form', () => {
    it('Given isDestination is true, When user clicks Regresar button, Then it should call goPrev', async () => {
      // Given isDestination is true
      const user = userEvent.setup()
      renderComponent({ isDestination: true })

      // When user clicks Regresar button
      const cancelButton = screen.getByTestId('destination-address-mn-cancel-button')
      await user.click(cancelButton)

      // Then it should call goPrev
      expect(mockGoPrev).toHaveBeenCalledTimes(1)
      expect(mockToggleModal).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form without selecting an alias', () => {
    it('Given no alias is selected, When user submits the form, Then it should display an error message', async () => {
      // Given no alias is selected and form is filled
      const user = userEvent.setup()
      renderComponent()

      // When user fills valid data and submits
      const nameInput = screen.getByTestId('name')
      const lastNameInput = screen.getByLabelText(/apellido/i)
      const phoneInput = screen.getByLabelText(/teléfono/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'Carlos')
      await user.clear(lastNameInput)
      await user.type(lastNameInput, 'García')
      await user.clear(phoneInput)
      await user.type(phoneInput, '5559876543')

      const submitButton = screen.getByTestId('origin-address-mn-next-button')
      await user.click(submitButton)

      // Then it should display an error message
      await waitFor(() => {
        expect(screen.getByText('Por favor selecciona un alias de dirección')).toBeInTheDocument()
      })
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form with valid alias selected', () => {
    it('Given a valid alias is selected and form is filled, When user submits the form, Then it should call updateAddress and goNext', async () => {
      // Given addresses are loaded and alias is saved
      const user = userEvent.setup()
      const savedAlias: AliasSavedMn = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        city: 'Ciudad de México',
        address: mockAddresses[0],
        addressMn: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }
      renderComponent({ aliasSaved: savedAlias })

      // When user fills personal data and submits
      const nameInput = screen.getByTestId('name')
      const lastNameInput = screen.getByLabelText(/apellido/i)
      const phoneInput = screen.getByLabelText(/teléfono/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'Carlos')
      await user.clear(lastNameInput)
      await user.type(lastNameInput, 'García')
      await user.clear(phoneInput)
      await user.type(phoneInput, '5559876543')

      const submitButton = screen.getByTestId('origin-address-mn-next-button')
      await user.click(submitButton)

      // Then it should call updateAddress with combined data
      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith({
          name: 'Carlos',
          lastName: 'García',
          phone: '5559876543',
          email: mockAddressData.email,
          company: mockAddressData.company,
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          reference: 'Cerca del parque'
        })
      })
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Submit form without city selected', () => {
    it('Given an alias is selected but city is empty, When user submits the form, Then it should display a city error', async () => {
      // Given an alias is selected but city is empty
      const user = userEvent.setup()
      const savedAliasWithoutCity: AliasSavedMn = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        city: '',
        address: mockAddresses[0],
        addressMn: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          city: '',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }
      renderComponent({ aliasSaved: savedAliasWithoutCity })

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-mn-next-button')
      await user.click(submitButton)

      // Then it should display a city error
      await waitFor(() => {
        expect(screen.getByText('Por favor selecciona una ciudad')).toBeInTheDocument()
      })
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Update saved alias when address info changes', () => {
    it('Given addresses are loaded, When user selects an alias, Then it should call updateSavedAlias with correct data', async () => {
      // Given addresses are loaded
      const user = userEvent.setup()
      renderComponent()

      // When user selects an alias from dropdown
      const dropdownButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(dropdownButton)

      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
      })

      const casaOption = screen.getByText('Casa')
      await user.click(casaOption)

      // Then it should call updateSavedAlias with formatted data
      await waitFor(() => {
        expect(mockUpdateSavedAlias).toHaveBeenCalledWith({
          alias: 'Casa',
          address: mockAddresses[0],
          addressMn: {
            street1: 'Calle Principal',
            external_number: '123',
            neighborhood: 'Centro',
            city: 'Ciudad de México',
            state: 'CDMX',
            reference: 'Cerca del parque'
          },
          town: 'Cuauhtémoc',
          city: 'Ciudad de México'
        })
      })
    })
  })

  describe('Scenario: Form validation for personal data', () => {
    it('Given invalid personal data, When user submits the form, Then it should display validation errors', async () => {
      // Given invalid personal data
      const user = userEvent.setup()
      const savedAlias: AliasSavedMn = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        city: 'Ciudad de México',
        address: mockAddresses[0],
        addressMn: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }
      renderComponent({ aliasSaved: savedAlias })

      // When user clears required fields and submits
      const nameInput = screen.getByTestId('name')
      const lastNameInput = screen.getByLabelText(/apellido/i)
      const phoneInput = screen.getByLabelText(/teléfono/i)

      await user.clear(nameInput)
      await user.clear(lastNameInput)
      await user.clear(phoneInput)

      const submitButton = screen.getByTestId('origin-address-mn-next-button')
      await user.click(submitButton)

      // Then it should display validation errors
      await waitFor(() => {
        expect(screen.getByText('Nombre es requerido')).toBeInTheDocument()
        expect(screen.getByText('Apellido es requerido')).toBeInTheDocument()
        expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument()
      })
      expect(mockUpdateAddress).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Display temporary address button', () => {
    it('Given the component renders, When displaying the form, Then it should show the temporary address button', () => {
      // Given the component renders
      renderComponent()

      // Then it should show the temporary address button
      expect(screen.getByText('Usar dirección temporal')).toBeInTheDocument()
    })
  })

  describe('Scenario: Saved alias is displayed on initialization', () => {
    it('Given an alias is saved, When the component renders, Then it should display the saved alias', () => {
      // Given an alias is saved
      const savedAlias: AliasSavedMn = {
        alias: 'Casa',
        town: 'Cuauhtémoc',
        city: 'Ciudad de México',
        address: mockAddresses[0],
        addressMn: {
          street1: 'Calle Principal',
          external_number: '123',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          reference: 'Cerca del parque'
        }
      }
      renderComponent({ aliasSaved: savedAlias })

      // Then it should display the saved alias
      expect(screen.getByText('Casa')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display domicilio section', () => {
    it('Given the component renders, When displaying the form, Then it should show the Domicilio section with instruction text', () => {
      // Given the component renders
      renderComponent()

      // Then it should show the Domicilio heading
      expect(screen.getByText('Domicilio')).toBeInTheDocument()
      
      // And it should show the instruction text
      expect(screen.getByText('Selecciona una dirección o llene una dirección temporal')).toBeInTheDocument()
    })
  })
})
