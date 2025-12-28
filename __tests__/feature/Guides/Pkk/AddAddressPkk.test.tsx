import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddAddressPkk } from '@/features/Guides/Pkk/AddAddressPkk'
import { CreateGuideAddressValuesPkk, AliasesSavedPkk } from '@/shared/types/guides.types'
import { Address } from '@/shared/types/addresses.types'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'

// Mock the hooks
jest.mock('../../../../src/shared/hooks/useAddAddress', () => ({
  useAddAddress: jest.fn()
}))

jest.mock('../../../../src/shared/hooks/useAlias', () => ({
  useSelectAlias: jest.fn()
}))

import { useAddAddress } from '@/shared/hooks/useAddAddress'

const mockUseAddAddress = useAddAddress as jest.MockedFunction<typeof useAddAddress>

describe('Feature: Add Address for Pkk', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryProviderWrapper>{component}</QueryProviderWrapper>)
  }

  const mockAddress: Address = {
    id: '123',
    alias: 'Test Alias',
    addressName: 'Test Street',
    neighborhood: 'Test Neighborhood',
    city: ['Test City'],
    town: ['Test Town'],
    state: 'Test State',
    zipcode: '12345',
    country: 'MX',
    user: 'user123'
  }

  const mockAliasSaved: AliasesSavedPkk = {
    alias: 'Test Alias',
    town: 'Test Town',
    city: 'Test City',
    address: mockAddress,
    addressPkk: {
      street1: 'Test Street',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'Test State',
      zipcode: '12345'
    }
  }

  const mockAddressData: CreateGuideAddressValuesPkk = {
    name: 'John',
    lastName: 'Doe',
    phone: '5551234567',
    email: 'john@example.com',
    street1: 'Test Street',
    neighborhood: 'Test Neighborhood',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    isResidential: false
  }

  const mockGoNext = jest.fn()
  const mockGoPrev = jest.fn()
  const mockToggleModal = jest.fn()
  const mockUpdateAddress = jest.fn()
  const mockUpdateSavedAlias = jest.fn()

  const defaultUseAddAddressReturn = {
    aliasSelected: true,
    setAliasSelected: jest.fn(),
    addressError: '',
    setAddressError: jest.fn(),
    townError: '',
    cityError: '',
    setTownError: jest.fn(),
    setCityError: jest.fn(),
    handleCancel: jest.fn(),
    addressType: 'origin' as const,
    cancelButtonText: 'Cancelar',
    cancelColorButton: 'red' as const,
    useTempAddress: false,
    toggleTempAddress: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAddAddress.mockReturnValue(defaultUseAddAddressReturn)
  })

  describe('Scenario: Render form with personal data and address fields', () => {
    it('Given address data is provided, When the form renders, Then it should display personal data and address dropdown', () => {
      // Given address data is provided and When the form renders
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then personal data fields should be displayed
      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^apellido$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^teléfono$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico \(opcional\)/i)).toBeInTheDocument()

      // And address dropdown should be displayed
      expect(screen.getByText(/alias de dirección/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Render residential toggle switch', () => {
    it('Given isResidential is false, When the form renders, Then the toggle should be unchecked', () => {
      // Given isResidential is false and When the form renders
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then the toggle should be unchecked
      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).not.toBeChecked()
    })

    it('Given isResidential is true, When the form renders, Then the toggle should be checked', () => {
      // Given isResidential is true
      const residentialAddress = { ...mockAddressData, isResidential: true }

      // When the form renders
      renderWithProviders(
        <AddAddressPkk
          addressData={residentialAddress}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then the toggle should be checked
      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).toBeChecked()
    })
  })

  describe('Scenario: Toggle residential switch', () => {
    it('Given the form renders, When user clicks the residential toggle, Then it should change state', async () => {
      // Given the form renders
      const user = userEvent.setup()
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).not.toBeChecked()

      // When user clicks the toggle
      await user.click(toggle)

      // Then it should be checked
      expect(toggle).toBeChecked()
    })
  })

  describe('Scenario: Submit form with valid data and selected alias', () => {
    it('Given valid form data and selected alias, When user submits, Then it should call updateAddress and goNext', async () => {
      // Given valid form data and selected alias
      const user = userEvent.setup()
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then it should call updateAddress with combined data
      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith(expect.objectContaining({
          name: 'John',
          lastName: 'Doe',
          phone: '5551234567',
          email: 'john@example.com',
          street1: 'Test Street',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          zipcode: '12345',
          isResidential: false
        }))
      })

      // And it should call goNext
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Submit form with updated residential status', () => {
    it('Given user toggles residential switch, When user submits, Then it should include updated isResidential', async () => {
      // Given the form renders
      const user = userEvent.setup()
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user toggles residential switch
      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      await user.click(toggle)

      // And submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then updateAddress should include isResidential true
      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith(expect.objectContaining({
          isResidential: true
        }))
      })
    })
  })

  describe('Scenario: Submit form without selected alias', () => {
    it('Given no alias is selected, When user submits, Then it should show error and not proceed', async () => {
      // Given no alias is selected
      const user = userEvent.setup()
      const setAddressError = jest.fn()
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        aliasSelected: false,
        setAddressError
      })

      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then it should set address error
      await waitFor(() => {
        expect(setAddressError).toHaveBeenCalledWith('Por favor selecciona un alias de dirección')
      })

      // And it should not call updateAddress or goNext
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form with null addressPkk', () => {
    it('Given addressPkk is null, When user submits, Then it should show error and not proceed', async () => {
      // Given addressPkk is null
      const user = userEvent.setup()
      const setAddressError = jest.fn()
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        setAddressError
      })

      const aliasSavedWithNullAddress = {
        ...mockAliasSaved,
        addressPkk: null as any
      }

      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={aliasSavedWithNullAddress}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then it should set address error
      await waitFor(() => {
        expect(setAddressError).toHaveBeenCalledWith('La dirección seleccionada no es válida')
      })

      // And it should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith('Address selected is null')

      // And it should not call updateAddress or goNext
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Scenario: Display validation errors for required fields', () => {
    it('Given empty required fields, When user submits, Then it should show validation errors', async () => {
      // Given empty required fields
      const user = userEvent.setup()
      const emptyAddressData: CreateGuideAddressValuesPkk = {
        name: '',
        lastName: '',
        phone: '',
        email: '',
        street1: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        isResidential: false
      }

      renderWithProviders(
        <AddAddressPkk
          addressData={emptyAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then validation errors should be displayed
      expect(await screen.findByText(/nombre es requerido/i)).toBeInTheDocument()
      expect(await screen.findByText(/el teléfono es requerido/i)).toBeInTheDocument()

      // And updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Display validation error for invalid phone format', () => {
    it('Given phone with less than 10 digits, When user submits, Then it should show error', async () => {
      // Given phone with less than 10 digits
      const user = userEvent.setup()
      const invalidPhoneData = { ...mockAddressData, phone: '123' }

      renderWithProviders(
        <AddAddressPkk
          addressData={invalidPhoneData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-pkk-next-button')
      await user.click(submitButton)

      // Then validation error should be displayed
      expect(await screen.findByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument()

      // And updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Cancel button calls handleCancel', () => {
    it('Given the form is rendered, When user clicks cancel button, Then it should call handleCancel', async () => {
      // Given the form is rendered
      const user = userEvent.setup()
      const handleCancel = jest.fn()
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        handleCancel
      })

      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user clicks cancel button
      const cancelButton = screen.getByTestId('origin-address-pkk-cancel-button')
      await user.click(cancelButton)

      // Then handleCancel should be called
      expect(handleCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Display correct button configuration for origin address', () => {
    it('Given isDestination is false, When the form renders, Then buttons should have origin configuration', () => {
      // Given isDestination is false and When the form renders
      renderWithProviders(
        <AddAddressPkk
          isDestination={false}
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then cancel button should have origin test ID
      expect(screen.getByTestId('origin-address-pkk-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('origin-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display correct button configuration for destination address', () => {
    it('Given isDestination is true, When the form renders, Then buttons should have destination configuration', () => {
      // Given isDestination is true
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        addressType: 'destination',
        cancelButtonText: 'Regresar',
        cancelColorButton: 'light'
      })

      // When the form renders
      renderWithProviders(
        <AddAddressPkk
          isDestination={true}
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then cancel button should have destination test ID
      expect(screen.getByTestId('destination-address-pkk-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('destination-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display temporary address button', () => {
    it('Given the form renders, When checking for temp address button, Then it should be displayed', () => {
      // Given the form renders and When checking for temp address button
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then temporary address button should be displayed
      expect(screen.getByRole('button', { name: /usar dirección temporal/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Switch to temporary address form', () => {
    it('Given temp address is toggled, When the form renders, Then it should display AddTempAddressPkk', () => {
      // Given temp address is toggled
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        useTempAddress: true
      })

      // When the form renders
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then it should render the temp address form (which has different structure)
      // The AddTempAddressPkk has "Datos personales" and "Domicilio" sections
      const headers = screen.getAllByRole('heading', { level: 4 })
      expect(headers[0]).toHaveTextContent(/datos personales/i)
      expect(headers[1]).toHaveTextContent(/domicilio/i)
    })
  })

  describe('Scenario: Click temporary address button to toggle', () => {
    it('Given the form renders, When user clicks temp address button, Then it should call toggleTempAddress', async () => {
      // Given the form renders
      const user = userEvent.setup()
      const toggleTempAddress = jest.fn()
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        toggleTempAddress
      })

      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // When user clicks temp address button
      const tempAddressButton = screen.getByRole('button', { name: /usar dirección temporal/i })
      await user.click(tempAddressButton)

      // Then toggleTempAddress should be called
      expect(toggleTempAddress).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: PersonalDataForm should not display company field', () => {
    it('Given the form renders, When checking fields, Then company field should not be displayed', () => {
      // Given the form renders and When checking fields
      renderWithProviders(
        <AddAddressPkk
          addressData={mockAddressData}
          aliasSaved={mockAliasSaved}
          goNext={mockGoNext}
          goPrev={mockGoPrev}
          toggleModal={mockToggleModal}
          updateAddress={mockUpdateAddress}
          updateSavedAlias={mockUpdateSavedAlias}
        />
      )

      // Then company field should not be displayed
      expect(screen.queryByLabelText(/empresa/i)).not.toBeInTheDocument()
    })
  })
})
