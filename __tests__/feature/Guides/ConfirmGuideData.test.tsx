import { render, screen } from '@testing-library/react'
import { ConfirmGuideData } from '@/features/Guides/ConfirmGuideData'
import { CreateGuideFormValues, SearchProduct } from '@/shared/types/guides.types'
import { QuoteUI } from '@/shared/types/quotes.types'

// Mock functions for props
const mockGoPrev = jest.fn()
const mockCreateGuide = jest.fn()

// Mock data for testing
const mockOriginAddress = {
  name: 'Juan Pérez',
  phone: '5551234567',
  email: 'juan.perez@email.com',
  company: 'Empresa Origen',
  street1: 'Calle Principal 123',
  neighborhood: 'Centro',
  external_number: '123',
  city: 'Ciudad de México',
  state: 'CDMX',
  reference: 'Entre Av. Reforma y Insurgentes',
  postal_code: '06000',
  internal_number: ''
}

const mockDestinationAddress = {
  name: 'María González',
  phone: '5559876543',
  email: 'maria.gonzalez@email.com',
  company: 'Empresa Destino',
  street1: 'Avenida Secundaria 456',
  neighborhood: 'Roma Norte',
  external_number: '456',
  city: 'Guadalajara',
  state: 'Jalisco',
  reference: 'Frente al parque',
  postal_code: '06700',
  internal_number: ''
}

const mockParcelInfo = {
  content: 'Documentos importantes',
  value: 1500,
  quantity: 2
}

const mockFormData: CreateGuideFormValues = {
  originAddress: mockOriginAddress,
  destinationAddress: mockDestinationAddress,
  parcelInfo: mockParcelInfo
}

const mockSelectedProduct: SearchProduct = {
  code: 'SAT12345',
  description: 'Documentos y papelería'
}

const mockSelectedQuotes: QuoteUI[] = [
  {
    id: 'quote-123',
    service: 'Express',
    total: 250.50,
    typeService: 'nextDay',
    courier: 'DHL',
    source: 'Mn',
    amountFormatted: '$250.50',
    logoSrc: {
      source: 'dhl-logo.svg',
      provider: 'dhl',
      width: 100,
      height: 50
    }
  }
]

const defaultProps = {
  formData: mockFormData,
  selectedProduct: mockSelectedProduct,
  selectedQuotes: mockSelectedQuotes,
  isPending: false,
  goPrev: mockGoPrev,
  createGuide: mockCreateGuide
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ConfirmGuideData {...mergedProps} />)
}

describe('ConfirmGuideData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial component rendering', () => {
    it('should display all sections with correct titles and form data when component loads', () => {
      // Given the ConfirmGuideData is rendered with valid props
      renderComponent()

      // Then the main title should be displayed
      expect(screen.getByText('Confirmar datos')).toBeInTheDocument()

      // Then all section headers should be displayed
      expect(screen.getByText('Datos del remitente')).toBeInTheDocument()
      expect(screen.getByText('Datos del destinatario')).toBeInTheDocument()
      expect(screen.getByText('Información del paquete')).toBeInTheDocument()

      // Then origin address data should be displayed
      expect(screen.getByText('Nombre de la persona: Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('Teléfono de contacto: 555 123 4567')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico: juan.perez@email.com')).toBeInTheDocument()
      expect(screen.getByText('Nombre de la compañia: Empresa Origen')).toBeInTheDocument()
      expect(screen.getByText('Domicilio: Calle Principal 123')).toBeInTheDocument()
      expect(screen.getByText('Colonia: Centro')).toBeInTheDocument()
      expect(screen.getByText('Numero exterior: 123')).toBeInTheDocument()
      expect(screen.getByText('Ciudad: Ciudad de México')).toBeInTheDocument()
      expect(screen.getByText('Estado: CDMX')).toBeInTheDocument()
      expect(screen.getByText('Referencia del domicilio: Entre Av. Reforma y Insurgentes')).toBeInTheDocument()

      // Then destination address data should be displayed
      expect(screen.getByText('Nombre de la persona: María González')).toBeInTheDocument()
      expect(screen.getByText('Teléfono de contacto: 555 987 6543')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico: maria.gonzalez@email.com')).toBeInTheDocument()
      expect(screen.getByText('Nombre de la compañia: Empresa Destino')).toBeInTheDocument()
      expect(screen.getByText('Domicilio: Avenida Secundaria 456')).toBeInTheDocument()
      expect(screen.getByText('Colonia: Roma Norte')).toBeInTheDocument()
      expect(screen.getByText('Numero exterior: 456')).toBeInTheDocument()
      expect(screen.getByText('Ciudad: Guadalajara')).toBeInTheDocument()
      expect(screen.getByText('Estado: Jalisco')).toBeInTheDocument()
      expect(screen.getByText('Referencia del domicilio: Frente al parque')).toBeInTheDocument()

      // Then parcel information should be displayed with proper formatting
      expect(screen.getByText('Descripción del contenido del paquete: Documentos importantes')).toBeInTheDocument()
      expect(screen.getByText('Valor del paquete: $1,500.00')).toBeInTheDocument()
      expect(screen.getByText('Cantidad: 2')).toBeInTheDocument()

      // Then buttons should be present with correct test IDs
      expect(screen.getByTestId('confirm-guide-cancel-button')).toBeInTheDocument()
      expect(screen.getByText('Regresar')).toBeInTheDocument()
      
      expect(screen.getByTestId('confirm-guide-send-button')).toBeInTheDocument()
      expect(screen.getByText('Crear guia')).toBeInTheDocument()
    })
  })
})