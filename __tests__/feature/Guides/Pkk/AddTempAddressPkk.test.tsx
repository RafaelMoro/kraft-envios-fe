import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AddTempAddressPkk } from '@/features/Guides/Pkk/AddTempAddressPkk'
import { CreateGuideAddressValuesPkk, AddressType } from '@/shared/types/guides.types'

describe('Feature: Add Temporary Address for Pkk', () => {
  const mockAddressData: CreateGuideAddressValuesPkk = {
    name: 'John',
    lastName: 'Doe',
    phone: '5551234567',
    email: 'john@example.com',
    company: 'Test Company',
    street1: 'Test Street',
    neighborhood: 'Test Neighborhood',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    isResidential: false
  }

  const mockGoNext = jest.fn()
  const mockToggleTempAddress = jest.fn()
  const mockUpdateAddress = jest.fn()
  const addressType: AddressType = 'origin'

  const renderComponent = (addressData: CreateGuideAddressValuesPkk = mockAddressData, type: AddressType = addressType) => {
    return render(
      <QueryProviderWrapper>
        <AddTempAddressPkk
          addressData={addressData}
          addressType={type}
          goNext={mockGoNext}
          toggleTempAddress={mockToggleTempAddress}
          updateAddress={mockUpdateAddress}
        />
      </QueryProviderWrapper>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display all form fields with default values', () => {
    it('Given address data is provided, When the form renders, Then it should display all fields with their default values', () => {
      // Given address data is provided and When the form renders
      renderComponent()

      // Then personal data fields should be displayed with default values
      expect(screen.getByLabelText(/^nombre$/i)).toHaveValue('John')
      expect(screen.getByLabelText(/^apellido$/i)).toHaveValue('Doe')
      expect(screen.getByLabelText(/correo electrónico \(opcional\)/i)).toHaveValue('john@example.com')
      expect(screen.getByLabelText(/^teléfono$/i)).toHaveValue('5551234567')

      // And address fields should be displayed with default values
      expect(screen.getByLabelText(/^calle$/i)).toHaveValue('Test Street')
      // Autocomplete fields (neighborhood, state, city) are dropdowns with button triggers
      expect(screen.getByTestId('autocomplete-dropdown-neighborhood-button')).toHaveTextContent('Test Neighborhood')
      expect(screen.getByTestId('autocomplete-dropdown-state-button')).toHaveTextContent('Test State')
      expect(screen.getByTestId('autocomplete-dropdown-city-button')).toHaveTextContent('Test City')
    })
  })

  describe('Scenario: Display residential toggle switch', () => {
    it('Given isResidential is false, When the form renders, Then the toggle switch should be unchecked', () => {
      // Given isResidential is false and When the form renders
      renderComponent()

      // Then the toggle should be unchecked
      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).not.toBeChecked()
    })

    it('Given isResidential is true, When the form renders, Then the toggle switch should be checked', () => {
      // Given isResidential is true
      const residentialAddress = { ...mockAddressData, isResidential: true }
      
      // When the form renders
      renderComponent(residentialAddress)

      // Then the toggle should be checked
      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).toBeChecked()
    })
  })

  describe('Scenario: Toggle residential switch', () => {
    it('Given the form renders, When user clicks the residential toggle, Then it should change state', async () => {
      // Given the form renders
      const user = userEvent.setup()
      renderComponent()

      const toggle = screen.getByRole('switch', { name: /es residencial/i })
      expect(toggle).not.toBeChecked()

      // When user clicks the toggle
      await user.click(toggle)

      // Then it should be checked
      expect(toggle).toBeChecked()
    })
  })

  describe('Scenario: User can edit form fields', () => {
    it('Given the form renders, When user types in text fields, Then the values should update', async () => {
      // Given the form renders
      const user = userEvent.setup()
      renderComponent()

      // When user clears and types in name field
      const nameInput = screen.getByTestId('name')
      await user.clear(nameInput)
      await user.type(nameInput, 'Jane')
      expect(nameInput).toHaveValue('Jane')

      // When user clears and types in phone field
      const phoneInput = screen.getByTestId('phone')
      await user.clear(phoneInput)
      await user.type(phoneInput, '5559876543')
      expect(phoneInput).toHaveValue('5559876543')

      // When user clears and types in street field
      const streetInput = screen.getByTestId('street1')
      await user.clear(streetInput)
      await user.type(streetInput, 'New Street')
      expect(streetInput).toHaveValue('New Street')
    })
  })

  describe('Scenario: Submit form with valid data', () => {
    it('Given valid form data, When user submits the form, Then it should call updateAddress and goNext', async () => {
      // Given valid form data
      const user = userEvent.setup()
      renderComponent()

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-next-button')
      const zipcodeInput = screen.getByTestId('zipcode')
      await user.clear(zipcodeInput)
      await user.type(zipcodeInput, '12345') // Ensure zipcode is valid
      await user.click(submitButton)

      // Then it should call updateAddress with the data including lastName and email
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

      // And it should call goNext
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Display validation errors for required fields', () => {
    it('Given empty required fields, When user submits the form, Then it should show validation errors', async () => {
      // Given empty required fields
      const user = userEvent.setup()
      const emptyAddressData: CreateGuideAddressValuesPkk = {
        name: '',
        lastName: '',
        phone: '',
        email: '',
        company: '',
        street1: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        isResidential: false
      }

      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={emptyAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then validation errors should be displayed
      expect(await screen.findByText(/nombre es requerido/i)).toBeInTheDocument()
      expect(await screen.findByText(/apellido es requerido/i)).toBeInTheDocument()
      expect(await screen.findByText(/el teléfono es requerido/i)).toBeInTheDocument()
      expect(await screen.findByText(/calle es requerida/i)).toBeInTheDocument()
      expect(await screen.findByText(/colonia es requerida/i)).toBeInTheDocument()
      expect(await screen.findByText(/ciudad es requerida/i)).toBeInTheDocument()
      expect(await screen.findByText(/estado es requerido/i)).toBeInTheDocument()
      expect(await screen.findByText(/la dirección postal es requerida/i)).toBeInTheDocument()

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

      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={invalidPhoneData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then validation error should be displayed
      expect(await screen.findByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument()

      // And updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Display validation error for invalid zipcode format', () => {
    it('Given zipcode with less than 5 digits, When user submits, Then it should show error', async () => {
      // Given zipcode with less than 5 digits
      const user = userEvent.setup()
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Clear and enter invalid zipcode
      const zipcodeInput = screen.getByTestId('zipcode')
      await user.clear(zipcodeInput)
      await user.type(zipcodeInput, '123')

      // When user submits the form
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then validation error should be displayed
      expect(await screen.findByText(/la dirección postal debe tener 5 caracteres/i)).toBeInTheDocument()

      // And updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Cancel button triggers toggleTempAddress', () => {
    it('Given the form is rendered, When user clicks cancel button, Then it should call toggleTempAddress', async () => {
      // Given the form is rendered
      const user = userEvent.setup()
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // When user clicks cancel button
      const cancelButton = screen.getByTestId('origin-address-pkk-temp-cancel-button')
      await user.click(cancelButton)

      // Then toggleTempAddress should be called
      expect(mockToggleTempAddress).toHaveBeenCalledTimes(1)

      // And updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Display correct button test IDs based on address type', () => {
    it('Given addressType is origin, When the form renders, Then cancel button should have origin test ID', () => {
      // Given addressType is origin and When the form renders
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType="origin"
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then cancel button should have origin test ID
      expect(screen.getByTestId('origin-address-pkk-temp-cancel-button')).toBeInTheDocument()
    })

    it('Given addressType is destination, When the form renders, Then cancel button should have destination test ID', () => {
      // Given addressType is destination and When the form renders
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType="destination"
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then cancel button should have destination test ID
      expect(screen.getByTestId('destination-address-pkk-temp-cancel-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display form section headers', () => {
    it('Given the form renders, When checking headers, Then it should show personal data and address section headers', () => {
      // Given the form renders and When checking headers
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then section headers should be displayed
      const headers = screen.getAllByRole('heading', { level: 4 })
      expect(headers[0]).toHaveTextContent(/datos personales/i)
      expect(headers[1]).toHaveTextContent(/domicilio/i)
    })
  })

  describe('Scenario: Fields have correct input types', () => {
    it('Given the form renders, When checking input types, Then email should be email type and others should be text', () => {
      // Given the form renders and When checking input types
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then email field should have type email
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('type', 'email')

      // And other fields should have type text
      expect(screen.getByTestId('name')).toHaveAttribute('type', 'text')
      expect(screen.getByTestId('phone')).toHaveAttribute('type', 'text')
      expect(screen.getByTestId('street1')).toHaveAttribute('type', 'text')
    })
  })

  describe('Scenario: Numeric fields have numeric input mode', () => {
    it('Given the form renders, When checking input modes, Then phone and zipcode should have numeric inputMode', () => {
      // Given the form renders and When checking input modes
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={mockAddressData}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then phone and zipcode should have numeric inputMode
      expect(screen.getByTestId('phone')).toHaveAttribute('inputMode', 'numeric')
      expect(screen.getByTestId('zipcode')).toHaveAttribute('inputMode', 'numeric')
    })
  })

  describe('Scenario: Handle null or undefined email', () => {
    it('Given email is null, When the form renders, Then email field should display empty string', () => {
      // Given email is null
      const addressWithNullEmail = { ...mockAddressData, email: null }

      // When the form renders
      render(
        <QueryProviderWrapper>
          <AddTempAddressPkk
            addressData={addressWithNullEmail}
            addressType={addressType}
            goNext={mockGoNext}
            toggleTempAddress={mockToggleTempAddress}
            updateAddress={mockUpdateAddress}
          />
        </QueryProviderWrapper>
      )

      // Then email field should show empty string
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('')
    })
  })
})
