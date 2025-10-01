import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  describe('Guide creation submission', () => {
    it('should call createGuide with correct payload structure when user clicks submit button', async () => {
      // Given the ConfirmGuideData is rendered with valid data
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the 'Crear guia' button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then createGuide should be called with correct payload structure
      expect(mockCreateGuide).toHaveBeenCalledTimes(1)
      expect(mockCreateGuide).toHaveBeenCalledWith({
        quoteId: 'quote-123',
        origin: {
          ...mockOriginAddress,
          country: 'MX'
        },
        destination: {
          ...mockDestinationAddress,
          country: 'MX'
        },
        parcel: {
          ...mockParcelInfo,
          satProductId: 'SAT12345'
        }
      })
    })

    it('should include correct satProductId from selected product when product exists', async () => {
      // Given the ConfirmGuideData is rendered with a specific selected product
      const user = userEvent.setup()
      const customProduct = {
        code: 'CUSTOM_SAT_CODE',
        description: 'Custom product'
      }
      renderComponent({ selectedProduct: customProduct })

      // When user clicks the submit button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then payload should include the correct satProductId from the product
      expect(mockCreateGuide).toHaveBeenCalledWith(
        expect.objectContaining({
          parcel: expect.objectContaining({
            satProductId: 'CUSTOM_SAT_CODE'
          })
        })
      )
    })

    it('should include empty string for satProductId when no product is selected', async () => {
      // Given the ConfirmGuideData is rendered without selected product
      const user = userEvent.setup()
      renderComponent({ selectedProduct: null })

      // When user clicks the submit button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then payload should include empty string for satProductId
      expect(mockCreateGuide).toHaveBeenCalledWith(
        expect.objectContaining({
          parcel: expect.objectContaining({
            satProductId: ''
          })
        })
      )
    })

    it('should use first quote ID from selectedQuotes array', async () => {
      // Given the ConfirmGuideData is rendered with multiple quotes
      const user = userEvent.setup()
      const multipleQuotes = [
        {
          id: 'first-quote',
          service: 'Express',
          total: 250.50,
          typeService: 'nextDay' as const,
          courier: 'DHL' as const,
          source: 'Mn' as const,
          amountFormatted: '$250.50',
          logoSrc: {
            source: 'dhl-logo.svg',
            provider: 'dhl' as const,
            width: 100,
            height: 50
          }
        },
        {
          id: 'second-quote',
          service: 'Standard',
          total: 150.00,
          typeService: 'standard' as const,
          courier: 'Estafeta' as const,
          source: 'Mn' as const,
          amountFormatted: '$150.00',
          logoSrc: {
            source: 'estafeta-logo.svg',
            provider: 'estafeta' as const,
            width: 100,
            height: 50
          }
        }
      ]
      renderComponent({ selectedQuotes: multipleQuotes })

      // When user clicks the submit button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then payload should use the first quote's ID
      expect(mockCreateGuide).toHaveBeenCalledWith(
        expect.objectContaining({
          quoteId: 'first-quote'
        })
      )
    })

    it('should include country MX for both origin and destination addresses', async () => {
      // Given the ConfirmGuideData is rendered with address data
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the submit button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then both origin and destination should have country 'MX'
      expect(mockCreateGuide).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: expect.objectContaining({
            country: 'MX'
          }),
          destination: expect.objectContaining({
            country: 'MX'
          })
        })
      )
    })

    it('should spread all form data properties into payload correctly', async () => {
      // Given the ConfirmGuideData is rendered with complete form data
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the submit button
      const submitButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(submitButton)

      // Then payload should contain all original form data properties
      const expectedCall = mockCreateGuide.mock.calls[0][0]
      
      // Verify origin contains all address fields plus country
      expect(expectedCall.origin).toEqual({
        ...mockOriginAddress,
        country: 'MX'
      })
      
      // Verify destination contains all address fields plus country
      expect(expectedCall.destination).toEqual({
        ...mockDestinationAddress,
        country: 'MX'
      })
      
      // Verify parcel contains all parcel info plus satProductId
      expect(expectedCall.parcel).toEqual({
        ...mockParcelInfo,
        satProductId: 'SAT12345'
      })
    })
  })
})