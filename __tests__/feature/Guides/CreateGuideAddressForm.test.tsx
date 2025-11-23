import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateGuideAddressForm } from '@/features/Guides/Mn/CreateGuideAddressForm'
import { initialStateAddressForm } from '@/shared/constants/guides.constants'

// Mock functions for props
const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockUpdateAddress = jest.fn()
const mockToggleModal = jest.fn()

const defaultProps = {
  title: 'Test Address Form',
  addressData: initialStateAddressForm,
  isMobileTablet: false,
  goNext: mockGoNext,
  goPrev: mockGoPrev,
  updateAddress: mockUpdateAddress,
  toggleModal: mockToggleModal,
  isDestination: false
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<CreateGuideAddressForm {...mergedProps} />)
}

describe('CreateGuideAddressForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering with origin address props', () => {
    it('should display all form fields with correct labels when rendering origin address form', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props (isDestination=false)
      renderComponent({ isDestination: false })

      // Then section headings should be displayed
      expect(screen.getByText('Datos personales')).toBeInTheDocument()
      expect(screen.getByText('Domicilio')).toBeInTheDocument()

      // Then all form fields should be displayed with correct labels
      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/calle/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/colonia/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numero exterior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre de la compañia/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estado de la república/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/referencia del domicilio/i)).toBeInTheDocument()
    })

    it('should display cancel button with correct text and styling for origin address', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props (isDestination=false)
      renderComponent({ isDestination: false })

      // Then cancel button shows 'Cancelar' with red color
      const cancelButton = screen.getByTestId('origin-address-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Cancelar')
      expect(cancelButton).toHaveClass('text-red-700')
    })

    it('should display next button with correct text', () => {
      // Given the CreateGuideAddressForm is rendered with origin address props
      renderComponent()

      // Then next button should be displayed
      const nextButton = screen.getByTestId('origin-address-next-button')
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
      // Given the CreateGuideAddressForm is rendered with destination address props (isDestination=true)
      renderComponent({ isDestination: true })

      // Then cancel button shows 'Regresar' with light color and outline style
      const cancelButton = screen.getByTestId('origin-address-cancel-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Regresar')
      expect(cancelButton).toHaveClass('border-gray-300')
    })
  })

  describe('Form validation for required fields', () => {
    it('should display validation errors when submitting form with empty required fields', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user submits form with empty required fields
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then appropriate length validation error should be displayed
      expect(await screen.findByText('El teléfono debe tener 10 dígitos')).toBeInTheDocument()
    })

    it('should display validation error for invalid email format', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user fills all required fields first
      await user.type(screen.getByTestId('name'), 'John Doe')
      await user.type(screen.getByTestId('street1'), 'Main Street 123')
      await user.type(screen.getByTestId('neighborhood'), 'Downtown')
      await user.type(screen.getByTestId('external_number'), '123')
      await user.type(screen.getByTestId('city'), 'Mexico City')
      await user.type(screen.getByTestId('state'), 'CDMX')
      await user.type(screen.getByTestId('phone'), '5555551234')
      
      // And user enters invalid email format
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'invalid-email-format@a')
      
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
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
      
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then appropriate validation error should be displayed
      expect(await screen.findByText('La referencia del domicilio debe tener al menos 2 caracteres')).toBeInTheDocument()
    })
  })

  describe('Form submission', () => {
    it('should call updateAddress and goNext when form is submitted with valid data', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user fills all required fields with valid data
      await user.type(screen.getByTestId('name'), 'John Doe')
      await user.type(screen.getByTestId('street1'), 'Main Street 123')
      await user.type(screen.getByTestId('neighborhood'), 'Downtown')
      await user.type(screen.getByTestId('external_number'), '123')
      await user.type(screen.getByTestId('city'), 'Mexico City')
      await user.type(screen.getByTestId('state'), 'CDMX')
      await user.type(screen.getByTestId('phone'), '5555551234')
      
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then updateAddress should be called with the form data
      expect(mockUpdateAddress).toHaveBeenCalledWith({
        name: 'John Doe',
        street1: 'Main Street 123',
        neighborhood: 'Downtown',
        external_number: '123',
        city: 'Mexico City',
        company: '',
        state: 'CDMX',
        phone: '5555551234',
        email: '',
        reference: ''
      })
      
      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('should call updateAddress and goNext when form is submitted with valid data including optional fields', async () => {
      // Given the CreateGuideAddressForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user fills all fields (required and optional) with valid data
      await user.type(screen.getByTestId('name'), 'Jane Smith')
      await user.type(screen.getByTestId('street1'), 'Oak Avenue 456')
      await user.type(screen.getByTestId('neighborhood'), 'Uptown')
      await user.type(screen.getByTestId('external_number'), '456')
      await user.type(screen.getByTestId('city'), 'Guadalajara')
      await user.type(screen.getByTestId('company'), 'ACME Corp')
      await user.type(screen.getByTestId('state'), 'Jalisco')
      await user.type(screen.getByTestId('phone'), '3331234567')
      await user.type(screen.getByLabelText(/correo electrónico/i), 'jane@example.com')
      await user.type(screen.getByTestId('reference'), 'Next to the park')
      
      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      // Then updateAddress should be called with all the form data
      expect(mockUpdateAddress).toHaveBeenCalledWith({
        name: 'Jane Smith',
        street1: 'Oak Avenue 456',
        neighborhood: 'Uptown',
        external_number: '456',
        city: 'Guadalajara',
        company: 'ACME Corp',
        state: 'Jalisco',
        phone: '3331234567',
        email: 'jane@example.com',
        reference: 'Next to the park'
      })
      
      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })
})
