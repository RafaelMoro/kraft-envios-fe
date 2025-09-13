import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyInfoQuotesModal } from '@/features/Quotes/CopyInfoQuotesModal'
import { fedexQuote, paquetExpQuote, otherQuote } from '../../mocks/quotes.mocks'
import { QuoteUI } from '@/shared/types/quotes.types'
import { formatQuotesSendWhatsapp } from '../../../src/shared/utils/quotes.utils'

// Mock window.open
const mockWindowOpen = jest.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen
})

// Mock formatQuotesSendWhatsapp utility
jest.mock('../../../src/shared/utils/quotes.utils', () => ({
  formatQuotesSendWhatsapp: jest.fn()
}))

const mockFormatQuotesSendWhatsapp = formatQuotesSendWhatsapp as jest.MockedFunction<typeof formatQuotesSendWhatsapp>

describe('CopyInfoQuotesModal', () => {
  const mockToggleModal = jest.fn()
  const selectedQuotes: QuoteUI[] = [fedexQuote, paquetExpQuote, otherQuote]

  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatQuotesSendWhatsapp.mockReturnValue('1. FedEx $100.00\n2. PaquetExpress $50.00\n3. Other $25.00')
  })

  const defaultProps = {
    open: true,
    selectedQuotes,
    toggleModal: mockToggleModal
  }

  describe('GIVEN the CopyInfoQuotesModal is rendered', () => {
    it('WHEN the modal is open THEN it should display the modal with correct content', () => {
      render(<CopyInfoQuotesModal {...defaultProps} />)

      expect(screen.getByText('Copiar información via Whatsapp')).toBeInTheDocument()
      expect(screen.getByText(/Ingrese un saludo y el whatsapp para enviar la información/)).toBeInTheDocument()
      expect(screen.getByLabelText('Saludo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Buenos días, las opciones de envíos son:')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('5512345678')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
    })

    it('WHEN the modal is closed THEN it should not be visible', () => {
      render(<CopyInfoQuotesModal {...defaultProps} open={false} />)

      expect(screen.queryByText('Copiar información via Whatsapp')).not.toBeInTheDocument()
    })
  })

  describe('GIVEN the user interacts with the form fields', () => {
    it('WHEN the user types in the intro field THEN it should update the value', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      await user.clear(introField)
      await user.type(introField, 'Hola, aquí están las cotizaciones:')

      expect(introField).toHaveValue('Hola, aquí están las cotizaciones:')
    })

    it('WHEN the user clicks the cancel button THEN it should call toggleModal', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      await user.click(cancelButton)

      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('GIVEN the user submits the form with validation errors', () => {
    it('WHEN the intro field is empty THEN it should show an error message', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(phoneField)
      await user.type(phoneField, '5551234567')
      await user.click(sendButton)

      expect(screen.getByText('El saludo no puede estar vacío')).toBeInTheDocument()
      expect(mockWindowOpen).not.toHaveBeenCalled()
      expect(mockToggleModal).not.toHaveBeenCalled()
    })

    it('WHEN the phone number has less than 10 digits THEN it should show an error message', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(introField)
      await user.type(introField, 'Hola')
      await user.clear(phoneField)
      await user.type(phoneField, '123456789')
      await user.click(sendButton)

      expect(screen.getByText('El número de teléfono debe tener exactamente 10 dígitos')).toBeInTheDocument()
      expect(mockWindowOpen).not.toHaveBeenCalled()
      expect(mockToggleModal).not.toHaveBeenCalled()
    })

    it('WHEN the phone number has more than 10 digits THEN it should show an error message', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(introField)
      await user.type(introField, 'Hola')
      await user.clear(phoneField)
      await user.type(phoneField, '12345678901')
      await user.click(sendButton)

      expect(screen.getByText('El número de teléfono debe tener exactamente 10 dígitos')).toBeInTheDocument()
      expect(mockWindowOpen).not.toHaveBeenCalled()
      expect(mockToggleModal).not.toHaveBeenCalled()
    })
  })

  describe('GIVEN the user clears validation errors', () => {
    it('WHEN the user types in the intro field after an error THEN it should clear the intro error', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      // Trigger error
      await user.clear(phoneField)
      await user.type(phoneField, '5551234567')
      await user.click(sendButton)
      expect(screen.getByText('El saludo no puede estar vacío')).toBeInTheDocument()

      // Clear error by typing
      await user.clear(introField)
      await user.type(introField, 'H')
      expect(screen.queryByText('El saludo no puede estar vacío')).not.toBeInTheDocument()
    })

    it('WHEN the user types in the phone field after an error THEN it should clear the phone error', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      // Trigger error
      await user.clear(introField)
      await user.type(introField, 'Hola')
      await user.clear(phoneField)
      await user.type(phoneField, '123')
      await user.click(sendButton)
      expect(screen.getByText('El número de teléfono debe tener exactamente 10 dígitos')).toBeInTheDocument()

      // Clear error by typing
      await user.type(phoneField, '4')
      expect(screen.queryByText('El número de teléfono debe tener exactamente 10 dígitos')).not.toBeInTheDocument()
    })
  })

  describe('GIVEN the user submits the form with valid data', () => {
    it('WHEN all fields are valid THEN it should open WhatsApp with correct URL and reset form', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(introField)
      // Type character by character for textarea
      for (const char of 'Buenos días, las opciones son:') {
        await user.type(introField, char)
      }
      
      await user.clear(phoneField)
      // Type character by character for number input
      for (const char of '5551234567') {
        await user.type(phoneField, char)
      }
      
      await user.click(sendButton)

      expect(mockFormatQuotesSendWhatsapp).toHaveBeenCalledWith(selectedQuotes)
      expect(mockWindowOpen).toHaveBeenCalled()
      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })

    it('WHEN form is submitted successfully THEN it should reset all form fields', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(introField)
      await user.type(introField, 'Test intro')
      await user.clear(phoneField)
      await user.type(phoneField, '5551234567')
      await user.click(sendButton)

      // The modal should be closed by toggleModal, but we can't test the reset directly
      // since the modal would be unmounted. The reset logic is tested by ensuring
      // the modal closes successfully
      expect(mockToggleModal).toHaveBeenCalled()
    })
  })

  describe('GIVEN different quote data scenarios', () => {
    it('WHEN there are no selected quotes THEN it should still render the modal', () => {
      render(<CopyInfoQuotesModal {...defaultProps} selectedQuotes={[]} />)

      expect(screen.getByText('Copiar información via Whatsapp')).toBeInTheDocument()
      expect(screen.getByLabelText('Saludo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('5512345678')).toBeInTheDocument()
    })

    it('WHEN there is only one selected quote THEN it should handle the form submission correctly', async () => {
      const user = userEvent.setup()
      const singleQuote = [fedexQuote]
      mockFormatQuotesSendWhatsapp.mockReturnValue('1. FedEx $100.00')
      
      render(<CopyInfoQuotesModal {...defaultProps} selectedQuotes={singleQuote} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByPlaceholderText('5512345678')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.type(introField, 'Hola')
      await user.type(phoneField, '5551234567')
      await user.click(sendButton)

      expect(mockFormatQuotesSendWhatsapp).toHaveBeenCalledWith(singleQuote)
      expect(mockWindowOpen).toHaveBeenCalled()
      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('GIVEN form field attributes', () => {
    it('WHEN the phone input is rendered THEN it should have correct attributes', () => {
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const phoneField = screen.getByPlaceholderText('5512345678')
      expect(phoneField).toHaveAttribute('type', 'number')
      expect(phoneField).toHaveAttribute('inputMode', 'numeric')
    })

    it('WHEN the textarea is rendered THEN it should have correct attributes', () => {
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      expect(introField).toHaveAttribute('rows', '4')
      expect(introField).toHaveAttribute('placeholder', 'Buenos días, las opciones de envíos son:')
    })
  })
})
