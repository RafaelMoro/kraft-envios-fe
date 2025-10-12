import { render, screen } from '@testing-library/react'
import { ConfirmGuideDataTone } from '@/features/Guides/Tone/ConfirmGuideDataTone'
import { CreateGuideFormValuesTone } from '@/shared/types/guides.types'
import { fedexQuote } from '../../../mocks/quotes.mocks'

// Mock functions for props
const mockGoPrev = jest.fn()
const mockCreateGuide = jest.fn()

// Mock data for testing
const mockFormData: CreateGuideFormValuesTone = {
  originAddress: {
    name: 'Juan Pérez',
    lastName: 'González',
    street1: 'Av. Principal 123',
    neighborhood: 'Centro',
    town: 'Guadalajara',
    external_number: '123',
    state: 'Jalisco',
    phone: '5551234567',
    email: 'juan@example.com',
    reference: 'Entre calle A y B'
  },
  destinationAddress: {
    name: 'María López',
    lastName: 'Martínez',
    street1: 'Calle Secundaria 456',
    neighborhood: 'Roma Norte',
    town: 'Ciudad de México',
    external_number: '456',
    state: 'CDMX',
    phone: '5559876543',
    email: 'maria@example.com',
    reference: 'Edificio azul'
  },
  parcelInfo: {
    content: 'Documentos importantes',
    notifyMe: true
  }
}

const defaultProps = {
  formData: mockFormData,
  selectedQuotes: [fedexQuote],
  isPending: false,
  goPrev: mockGoPrev,
  createGuide: mockCreateGuide
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ConfirmGuideDataTone {...mergedProps} />)
}

describe('ConfirmGuideDataTone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component rendering with form data', () => {
    it('should display all sections with correct information from formData prop', () => {
      // Given ConfirmGuideDataTone is rendered with valid form data
      renderComponent()

      // Then it should display the main heading
      expect(screen.getByText('Confirmar datos')).toBeInTheDocument()

      // Then it should display sender data section
      expect(screen.getByText('Datos del remitente')).toBeInTheDocument()
      expect(screen.getByText('Nombre de la persona: Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('Teléfono de contacto: 555 123 4567')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico: juan@example.com')).toBeInTheDocument()
      expect(screen.getByText('Domicilio: Av. Principal 123')).toBeInTheDocument()
      expect(screen.getByText('Colonia: Centro')).toBeInTheDocument()
      expect(screen.getByText('Numero exterior: 123')).toBeInTheDocument()
      expect(screen.getByText('Ciudad: Guadalajara')).toBeInTheDocument()
      expect(screen.getByText('Estado: Jalisco')).toBeInTheDocument()
      expect(screen.getByText('Referencia del domicilio: Entre calle A y B')).toBeInTheDocument()

      // Then it should display recipient data section
      expect(screen.getByText('Datos del destinatario')).toBeInTheDocument()
      expect(screen.getByText('Nombre de la persona: María López')).toBeInTheDocument()
      expect(screen.getByText('Teléfono de contacto: 555 987 6543')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico: maria@example.com')).toBeInTheDocument()
      expect(screen.getByText('Domicilio: Calle Secundaria 456')).toBeInTheDocument()
      expect(screen.getByText('Colonia: Roma Norte')).toBeInTheDocument()
      expect(screen.getByText('Numero exterior: 456')).toBeInTheDocument()
      expect(screen.getByText('Ciudad: Ciudad de México')).toBeInTheDocument()
      expect(screen.getByText('Estado: CDMX')).toBeInTheDocument()
      expect(screen.getByText('Referencia del domicilio: Edificio azul')).toBeInTheDocument()

      // Then it should display package information section
      expect(screen.getByText('Información del paquete')).toBeInTheDocument()
      expect(screen.getByText('Descripción del contenido del paquete: Documentos importantes')).toBeInTheDocument()

      // Then it should display action buttons
      expect(screen.getByRole('button', { name: 'Regresar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Crear guia' })).toBeInTheDocument()
    })
  })
})
