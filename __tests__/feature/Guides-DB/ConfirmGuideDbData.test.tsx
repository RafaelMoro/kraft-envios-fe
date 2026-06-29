import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConfirmGuideDbData } from '@/features/Guides-DB/ConfirmGuideDbData'
import {
  CreateGuideAddressFormValuesMn,
  CreateGuideDbFormValues,
  PackageDimensions,
  SearchProduct,
} from '@/shared/types/guides.types'
import { QuoteUI } from '@/shared/types/quotes.types'

const mockGoPrev = jest.fn()
const mockOnSubmit = jest.fn()

const mockSearchProduct: SearchProduct = {
  code: 'SAT-CODE',
  description: 'Documentos y papelería',
}

const mockQuote: QuoteUI = {
  id: 'quote-1',
  service: 'Express',
  total: 100,
  typeService: 'nextDay',
  courier: 'DHL',
  source: 'GE',
  amountFormatted: '$100.00',
  logoSrc: { source: 'dhl.svg', provider: 'dhl', width: 100, height: 50 },
}

const mockPackageDimensions: PackageDimensions = {
  length: '20',
  width: '15',
  height: '10',
  weight: '2',
}

const baseAddress: CreateGuideAddressFormValuesMn = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Pérez',
  phone: '5551234567',
  email: 'juan@example.com',
  company: 'Mi Empresa',
  street1: 'Calle 1',
  external_number: '123',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtémoc',
  state: 'CDMX',
  zipcode: '06000',
  reference: 'Frente al parque',
}

const baseParcelInfo: CreateGuideDbFormValues['parcelInfo'] = {
  content: 'Documentos importantes',
  value: '1500',
  quantity: '2',
  notifyMe: false,
}

const renderComponent = (props: Partial<React.ComponentProps<typeof ConfirmGuideDbData>> = {}) => {
  const defaultProps = {
    originAddress: baseAddress,
    destinationAddress: { ...baseAddress, alias: 'Oficina', name: 'María', lastName: 'López', phone: '5559876543' },
    parcelInfo: baseParcelInfo,
    selectedQuote: mockQuote,
    packageDimensions: mockPackageDimensions,
    selectedProduct: mockSearchProduct,
    isPending: false,
    goPrev: mockGoPrev,
    onSubmit: mockOnSubmit,
  }
  return render(<ConfirmGuideDbData {...defaultProps} {...props} />)
}

describe('ConfirmGuideDbData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('When rendered, Then it shows the title and the four sections', () => {
      renderComponent()

      expect(screen.getByText('Confirmar datos')).toBeInTheDocument()
      expect(screen.getByText('Cotización')).toBeInTheDocument()
      expect(screen.getByText('Remitente')).toBeInTheDocument()
      expect(screen.getByText('Destinatario')).toBeInTheDocument()
      expect(screen.getByText('Paquete')).toBeInTheDocument()
    })

    it('When rendered, Then it shows the address data for both origin and destination', () => {
      renderComponent()

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('María López')).toBeInTheDocument()
      expect(screen.getAllByText('juan@example.com').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Mi Empresa').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Frente al parque').length).toBeGreaterThan(0)
    })

    it('When email/company/reference are absent, Then it does not render those rows', () => {
      renderComponent({
        originAddress: { ...baseAddress, email: '', company: '', reference: '' },
        destinationAddress: { ...baseAddress, alias: 'Oficina', email: '', company: '', reference: '' },
      })

      expect(screen.queryByText('juan@example.com')).not.toBeInTheDocument()
      expect(screen.queryByText('Mi Empresa')).not.toBeInTheDocument()
      expect(screen.queryByText('Frente al parque')).not.toBeInTheDocument()
    })

    it('When parcel value/quantity are absent, Then it does not render those rows', () => {
      renderComponent({
        parcelInfo: { ...baseParcelInfo, value: '', quantity: '' },
      })

      expect(screen.queryByText(/Valor:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Cantidad:/)).not.toBeInTheDocument()
    })

    it('When notifyMe is true, Then it shows the notification copy', () => {
      renderComponent({
        parcelInfo: { ...baseParcelInfo, notifyMe: true },
      })

      expect(screen.getByText('Notificarme: activado')).toBeInTheDocument()
    })

    it('When lastName is empty, Then the name row shows just the name trimmed', () => {
      renderComponent({
        originAddress: { ...baseAddress, lastName: '' },
      })

      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.queryByText('Juan ')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('When the Regresar button is clicked, Then it calls goPrev', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('confirm-guide-db-cancel-button'))

      expect(mockGoPrev).toHaveBeenCalledTimes(1)
    })
  })

  describe('Payload assembly', () => {
    it('When isPending is true, Then it shows the spinner instead of the label', () => {
      renderComponent({ isPending: true })

      expect(screen.queryByText('Crear guía')).not.toBeInTheDocument()
      expect(screen.getByLabelText('loading create guide db')).toBeInTheDocument()
    })

    it('When Crear guía is clicked, Then it calls onSubmit with the full DB payload', async () => {
      const user = userEvent.setup()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
      renderComponent()

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const payload = mockOnSubmit.mock.calls[0][0]
      expect(payload.provider).toBe('GE')
      expect(payload.quoteId).toBe('quote-1')
      expect(payload.origin.alias).toBe('Casa')
      expect(payload.origin.town).toBe('Cuauhtémoc')
      expect(payload.origin.zipcode).toBe('06000')
      expect(payload.origin.country).toBe('MX')
      expect(payload.origin.email).toBe('juan@example.com')
      expect(payload.destination.alias).toBe('Oficina')
      expect(payload.destination.town).toBe('Cuauhtémoc')
      expect(payload.parcel.length).toBe(20)
      expect(payload.parcel.content).toBe('Documentos importantes')
      expect(payload.parcel.value).toBe(1500)
      expect(payload.parcel.quantity).toBe(2)
      expect(payload.parcel.satProductId).toBe('SAT-CODE')
      expect(payload.notifyMe).toBe(false)

      consoleLogSpy.mockRestore()
    })

    it('When the email/company are missing on origin, Then the verify helper falls back to defaults', async () => {
      const user = userEvent.setup()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
      renderComponent({
        originAddress: { ...baseAddress, email: '', company: '' },
      })

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      const payload = mockOnSubmit.mock.calls[0][0]
      expect(payload.origin.email).toBe(process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com')
      expect(payload.origin.company).toBe('Kraft Envios')

      consoleLogSpy.mockRestore()
    })

    it('When the reference is missing on origin, Then the verify helper falls back to DEFAULT_REFERENCE', async () => {
      const user = userEvent.setup()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
      renderComponent({
        originAddress: { ...baseAddress, reference: '' },
      })

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      const payload = mockOnSubmit.mock.calls[0][0]
      expect(payload.origin.reference).toBe('Sin referencia')

      consoleLogSpy.mockRestore()
    })

    it('When parcel value/quantity are empty strings, Then they are omitted from the payload', async () => {
      const user = userEvent.setup()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
      renderComponent({
        parcelInfo: { ...baseParcelInfo, value: '', quantity: '' },
      })

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      const payload = mockOnSubmit.mock.calls[0][0]
      expect(payload.parcel).not.toHaveProperty('value')
      expect(payload.parcel).not.toHaveProperty('quantity')

      consoleLogSpy.mockRestore()
    })

    it('When selectedProduct is null, Then it does not call onSubmit', async () => {
      const user = userEvent.setup()
      renderComponent({ selectedProduct: null })

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('When packageDimensions is null, Then it does not call onSubmit (parcel helper returns null)', async () => {
      const user = userEvent.setup()
      renderComponent({ packageDimensions: null })

      await user.click(screen.getByTestId('confirm-guide-db-send-button'))

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})
