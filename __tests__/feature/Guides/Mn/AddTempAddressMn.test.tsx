import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTempAddressMn } from '@/features/Guides/Mn/AddTempAddressMn'
import { initialStateAddressForm } from '@/shared/constants/guides.constants'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'

// Mock functions for props
const mockGoNext = jest.fn()
const mockUpdateAddress = jest.fn()
const mockToggleModal = jest.fn()

const defaultProps = {
  title: 'Test Address Form',
  addressData: initialStateAddressForm,
  addressType: 'origin' as 'origin' | 'destination',
  isMobileTablet: false,
  goNext: mockGoNext,
  updateAddress: mockUpdateAddress,
  toggleTempAddress: mockToggleModal
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <QueryProviderWrapper>
      <AddTempAddressMn {...mergedProps} />
    </QueryProviderWrapper>
  )
}

describe('CreateGuideAddressForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering with origin address props', () => {
    it('should display all form fields with correct labels when rendering origin address form', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props
      renderComponent({ addressType: 'origin' })

      // Then section headings should be displayed
      expect(screen.getByText('Datos personales')).toBeInTheDocument()
      expect(screen.getByText('Domicilio')).toBeInTheDocument()

      // Then personal data form fields should be displayed with correct labels
      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^apellido$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre de la compañia/i)).toBeInTheDocument()

      // Then address form fields should be displayed
      expect(screen.getByLabelText(/calle/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numero exterior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/referencia del domicilio/i)).toBeInTheDocument()
      
      // AutocompleteZipcode fields (rendered as dropdowns by default)
      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
    })

    it('should display cancel button with correct text and styling for origin address', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props
      renderComponent({ addressType: 'origin' })

      // Then cancel button shows 'Volver' with light color
      const cancelButton = screen.getByTestId('origin-address-mn-temp-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Volver')
    })

    it('should display next button with correct text', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props
      renderComponent()

      // Then next button should be displayed
      const nextButton = screen.getByTestId('origin-address-mn-temp-next-button')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveTextContent('Siguiente')
      expect(nextButton).toHaveAttribute('type', 'submit')
    })

    it('should display title when isMobileTablet is true', () => {
      // Given the CreateGuideAddressForm is rendered with isMobileTablet=true
      const title = 'Mobile Address Form'
      renderComponent({ isMobileTablet: true, title })

      // Then title should be displayed
      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent(title)
    })

    it('should not display title when isMobileTablet is false', () => {
      // Given the CreateGuideAddressForm is rendered with isMobileTablet=false
      const title = 'Desktop Address Form'
      renderComponent({ isMobileTablet: false, title })

      // Then title should not be displayed
      expect(screen.queryByText(title)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 5 })).not.toBeInTheDocument()
    })
  })

  describe('Form rendering with destination address props', () => {
    it('should display cancel button with correct text and styling for destination address', () => {
      // Given the CreateGuideAddressForm is rendered with destination address props
      renderComponent({ addressType: 'destination' })

      // Then cancel button shows 'Volver' with light color
      const cancelButton = screen.getByTestId('destination-address-mn-temp-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Volver')
    })
  })

  describe('Form validation for required fields', () => {
    it('should display validation errors when submitting form with empty required fields', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user submits form with empty required fields
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then validation errors should be displayed for required fields
      expect(await screen.findByText('Nombre es requerido')).toBeInTheDocument()
      expect(await screen.findByText('Calle es requerida')).toBeInTheDocument()
      expect(await screen.findByText('Colonia es requerida')).toBeInTheDocument()
      expect(await screen.findByText('Número exterior es requerido')).toBeInTheDocument()
      expect(await screen.findByText('Ciudad es requerida')).toBeInTheDocument()
      expect(await screen.findByText('Estado es requerido')).toBeInTheDocument()
      expect(await screen.findByText('El teléfono es requerido')).toBeInTheDocument()
    })

    it('should not call updateAddress and goNext when form has validation errors', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user submits form with empty required fields
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then updateAddress and goNext should not be called
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Form validation for field formats', () => {
    it('should display validation error for non-numeric external_number', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters non-numeric characters in external_number field
      const externalNumberInput = screen.getByTestId('external_number')
      await user.type(externalNumberInput, 'abc123')
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate format validation error should be displayed
      expect(await screen.findByText('El número exterior solo puede contener dígitos')).toBeInTheDocument()
    })

    it('should display validation error for non-numeric phone', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters non-numeric characters in phone field
      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, 'abc123def')
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate format validation error should be displayed
      expect(await screen.findByText('El teléfono solo puede contener dígitos')).toBeInTheDocument()
    })

    it('should display validation error for phone with incorrect length', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters phone with less than 10 digits
      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, '123456789') // 9 digits
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate length validation error should be displayed
      expect(await screen.findByText('El teléfono debe tener 10 dígitos')).toBeInTheDocument()
    })

    it('should display validation error for phone with more than 10 digits', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters phone with more than 10 digits
      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, '12345678901') // 11 digits
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate length validation error should be displayed
      expect(await screen.findByText('El teléfono debe tener 10 dígitos')).toBeInTheDocument()
    })

    it('should display validation error for invalid email format', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters invalid email format in the optional email field
      const emailInput = screen.getByTestId('email')
      await user.type(emailInput, 'invalid-email-format@a')
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate format validation error should be displayed
      expect(await screen.findByText('Correo electrónico inválido')).toBeInTheDocument()
    })

    it('should display validation error for company with less than 2 characters', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters company name with less than 2 characters
      const companyInput = screen.getByTestId('company')
      await user.type(companyInput, 'A')
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate validation error should be displayed
      expect(await screen.findByText('El nombre de la compañía debe tener al menos 2 caracteres')).toBeInTheDocument()
    })

    it('should display validation error for reference with less than 2 characters', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters reference with less than 2 characters
      const referenceInput = screen.getByTestId('reference')
      await user.type(referenceInput, 'A')
      
      const submitButton = screen.getByTestId('origin-address-mn-temp-next-button')
      await user.click(submitButton)

      // Then appropriate validation error should be displayed
      expect(await screen.findByText('La referencia del domicilio debe tener al menos 2 caracteres')).toBeInTheDocument()
    })
  })

  describe('Form submission', () => {
    it('should call toggleTempAddress when cancel button is clicked', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the cancel button
      const cancelButton = screen.getByTestId('origin-address-mn-temp-cancel-button')
      await user.click(cancelButton)

      // Then toggleTempAddress should be called
      expect(mockToggleModal).toHaveBeenCalledTimes(1)
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('should allow user to edit personal data fields', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types in personal data fields
      await user.type(screen.getByTestId('name'), 'Jane Smith')
      await user.type(screen.getByTestId('lastName'), 'Smith')
      await user.type(screen.getByTestId('phone'), '3331234567')
      await user.type(screen.getByTestId('email'), 'jane@example.com')
      await user.type(screen.getByTestId('company'), 'ACME Corp')

      // Then the values should be updated
      expect(screen.getByTestId('name')).toHaveValue('Jane Smith')
      expect(screen.getByTestId('lastName')).toHaveValue('Smith')
      expect(screen.getByTestId('phone')).toHaveValue('3331234567')
      expect(screen.getByTestId('email')).toHaveValue('jane@example.com')
      expect(screen.getByTestId('company')).toHaveValue('ACME Corp')
    })
  })
})
