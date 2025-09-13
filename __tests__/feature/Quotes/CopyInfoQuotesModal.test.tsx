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
      expect(screen.getByTestId('phone-input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
    })

    it('WHEN the modal is closed THEN it should not be visible', () => {
      render(<CopyInfoQuotesModal {...defaultProps} open={false} />)

      expect(screen.queryByText('Copiar información via Whatsapp')).not.toBeInTheDocument()
    })
  })

  describe('GIVEN the user interacts with the form fields', () => {

    it('WHEN the user clicks the cancel button THEN it should call toggleModal', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      await user.click(cancelButton)

      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form validation errors', () => {
    it('Given a user filling the form with invalid data, then show error', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const phoneField = screen.getByTestId('phone-input')
      const introInput = screen.getByTestId('intro-input')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.click(sendButton)
      expect(screen.getByText('El saludo no puede estar vacío')).toBeInTheDocument()

      // Validate number with less than 10 digits
      await user.type(introInput, 'Hola')
      await user.clear(phoneField)
      await user.type(phoneField, '123456789')
      await user.click(sendButton)
      expect(await screen.findByText('El número de teléfono debe tener exactamente 10 dígitos')).toBeInTheDocument()

      // Validate number with more than 10 digits
      await user.clear(phoneField)
      await user.type(phoneField, '12345678901')
      await user.click(sendButton)
      expect(await screen.findByText('El número de teléfono debe tener exactamente 10 dígitos')).toBeInTheDocument()
    })
  })

  describe('GIVEN the user submits the form with valid data', () => {
    it('WHEN all fields are valid THEN it should open WhatsApp with correct URL and reset form', async () => {
      const user = userEvent.setup()
      render(<CopyInfoQuotesModal {...defaultProps} />)

      const introField = screen.getByLabelText('Saludo')
      const phoneField = screen.getByTestId('phone-input')
      const sendButton = screen.getByRole('button', { name: 'Enviar' })

      await user.clear(introField)
      await user.clear(phoneField)
      await user.type(introField, 'Buenos días, las opciones son:')
      await user.type(phoneField, '5551234567')
      
      await user.click(sendButton)

      expect(mockFormatQuotesSendWhatsapp).toHaveBeenCalledWith(selectedQuotes)
      expect(mockWindowOpen).toHaveBeenCalled()
      expect(mockToggleModal).toHaveBeenCalled()
    })
  })
})
