import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateGuideModal } from '@/features/Guides/Mn/CreateGuideModal'
import { QuoteUI } from '@/shared/types/quotes.types'
import { mockMatchMedia, QueryMatchMedia } from '../../utils-test/mockWatchMedia'

// Mock functions for props
const mockToggleModal = jest.fn()
const mockResetSelectedQuotes = jest.fn()

// Mock data for testing
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
  open: true,
  selectedQuotes: mockSelectedQuotes,
  toggleModal: mockToggleModal,
  resetSelectedQuotes: mockResetSelectedQuotes
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
      <CreateGuideModal {...mergedProps} />
    </QueryClientProvider>
  )
}

describe('CreateGuideModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock desktop viewport by default
    mockMatchMedia({ [QueryMatchMedia.isDesktop]: true })
  })

  describe('Modal initial rendering and step 1', () => {
    it('should display modal with header, stepper on desktop, and first step when open is true', () => {
      // Given the CreateGuideModal is rendered with open=true
      renderWithProviders()

      // Then modal should be visible with correct header
      expect(screen.getByText('Crear guía')).toBeInTheDocument()

      // Then stepper should be displayed on desktop
      expect(screen.getByText('Remitente')).toBeInTheDocument()
      expect(screen.getByText('Destinatario')).toBeInTheDocument()

      // Then first step (CreateGuideAddressForm for origin) should be rendered
      expect(screen.getByText('Datos personales')).toBeInTheDocument()
      expect(screen.getByText('Domicilio')).toBeInTheDocument()
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Teléfono')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico (Opcional)')).toBeInTheDocument()

      // Then current step should be highlighted (step 1)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should have correct stepper configuration with step 1 active', () => {
      // Given the CreateGuideModal is rendered
      renderWithProviders()

      // Then stepper should show step 1 as current
      const stepNumberCircle = document.getElementById('step-number-circle-1')
      expect(stepNumberCircle).toBeInTheDocument()
      
      // Then first step should be active
      expect(screen.getByText('Remitente')).toBeInTheDocument()
      
      // Then step 1 circle should have active styling (blue background)
      expect(stepNumberCircle).toHaveClass('bg-blue-800')
    })
  })

  describe('Modal closed state', () => {
    it('should not display modal content when open is false', () => {
      // Given the CreateGuideModal is rendered with open=false
      renderWithProviders({ open: false })

      // Then modal should not be visible
      expect(screen.queryByText('Crear guía')).not.toBeInTheDocument()
      expect(screen.queryByText('Nombre')).not.toBeInTheDocument()
    })
  })
})