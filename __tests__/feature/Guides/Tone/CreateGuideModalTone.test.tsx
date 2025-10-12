import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateGuideModalTone } from '@/features/Guides/Tone/CreateGuideModalTone'
import { QuoteUI } from '@/shared/types/quotes.types'

// Mock functions for props
const mockToggleModal = jest.fn()

// Mock data for testing
const mockSelectedQuotes: QuoteUI[] = [
  {
    id: 'quote-tone-123',
    service: 'Express',
    total: 180.75,
    typeService: 'nextDay',
    courier: 'DHL',
    source: 'TONE',
    amountFormatted: '$180.75',
    logoSrc: {
      source: 'dhl-logo.svg',
      provider: 'dhl',
      width: 100,
      height: 50
    }
  }
]

const defaultProps = {
  open: true,
  selectedQuotes: mockSelectedQuotes,
  toggleModal: mockToggleModal
}

// Setup QueryClient for TanStack Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const renderWithProviders = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  const queryClient = createTestQueryClient()
  
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateGuideModalTone {...mergedProps} />
    </QueryClientProvider>
  )
}

describe('CreateGuideModalTone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modal initial rendering and step 1', () => {
    it('should display modal with header, stepper on desktop, and first step when open is true', () => {
      // Given CreateGuideModalTone is rendered with open=true
      renderWithProviders()

      // Then modal should be visible with correct header
      expect(screen.getByText('Crear guía')).toBeInTheDocument()

      // Then stepper should be displayed on desktop
      const stepper = screen.getByRole('list', { name: 'Steps' })
      expect(stepper).toBeInTheDocument()

      // Then first step (CreateGuideAddressFormTone for origin) should be rendered
      expect(screen.getByText('Nombre de la persona')).toBeInTheDocument()
      expect(screen.getByText('Apellido de la persona')).toBeInTheDocument()
      expect(screen.getByText('Teléfono')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico (Opcional)')).toBeInTheDocument()

      // Then current step should be highlighted (step 1)
      expect(screen.getByText('Domicilio origen')).toBeInTheDocument()
      
      // Then action buttons should be present
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    })

    it('should have correct stepper configuration with step 1 active', () => {
      // Given CreateGuideModalTone is rendered
      renderWithProviders()

      // Then stepper should show all steps
      expect(screen.getByText('Domicilio origen')).toBeInTheDocument()
      expect(screen.getByText('Domicilio destino')).toBeInTheDocument()
      expect(screen.getByText('Información del paquete')).toBeInTheDocument()
      expect(screen.getByText('Confirmar datos')).toBeInTheDocument()

      // Then step 1 should be active
      const stepperList = screen.getByRole('list', { name: 'Steps' })
      expect(stepperList).toBeInTheDocument()
    })
  })

  describe('Modal closed state', () => {
    it('should not display modal content when open is false', () => {
      // Given CreateGuideModalTone is closed (open=false)
      renderWithProviders({ open: false })

      // Then modal content should not be visible
      expect(screen.queryByText('Crear guía')).not.toBeInTheDocument()
      expect(screen.queryByText('Nombre de la persona')).not.toBeInTheDocument()
      expect(screen.queryByText('Domicilio origen')).not.toBeInTheDocument()
    })
  })
})
