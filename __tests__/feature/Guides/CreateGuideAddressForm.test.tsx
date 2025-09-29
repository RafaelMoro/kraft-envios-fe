import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateGuideAddressForm } from '@/features/Guides/CreateGuideAddressForm'
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

      // Then all form fields should be displayed with correct labels
      expect(screen.getByLabelText(/nombre de la persona/i)).toBeInTheDocument()
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
})
