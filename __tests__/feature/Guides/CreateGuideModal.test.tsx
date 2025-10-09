import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateGuideModal } from '@/features/Guides/Mn/CreateGuideModal'
import { QuoteUI } from '@/shared/types/quotes.types'

// Mock functions for props
const mockToggleModal = jest.fn()

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
      <CreateGuideModal {...mergedProps} />
    </QueryClientProvider>
  )
}

describe('CreateGuideModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modal initial rendering and step 1', () => {
    it('should display modal with header, stepper on desktop, and first step when open is true', () => {
      // Given the CreateGuideModal is rendered with open=true
      renderWithProviders()

      // Then modal should be visible with correct header
      expect(screen.getByText('Crear guía')).toBeInTheDocument()

      // Then stepper should be displayed on desktop
      expect(screen.getByLabelText('Steps')).toBeInTheDocument()
      expect(screen.getByText('Domicilio origen')).toBeInTheDocument()

      // Then first step (CreateGuideAddressForm for origin) should be rendered
      expect(screen.getByText('Nombre de la persona')).toBeInTheDocument()
      expect(screen.getByText('Teléfono')).toBeInTheDocument()
      expect(screen.getByText('Correo electrónico (Opcional)')).toBeInTheDocument()

      // Then current step should be highlighted (step 1)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should have correct stepper configuration with step 1 active', () => {
      // Given the CreateGuideModal is rendered
      renderWithProviders()

      // Then stepper should show step 1 as current
      const stepsList = screen.getByLabelText('Steps')
      expect(stepsList).toBeInTheDocument()
      
      // Then first step should be active
      expect(screen.getByText('Domicilio origen')).toBeInTheDocument()
      
      // Check that step 1 is marked as current
      const currentStepItem = screen.getByLabelText('Steps').querySelector('[aria-current="step"]')
      expect(currentStepItem).toBeInTheDocument()
    })
  })

  describe('Modal closed state', () => {
    it('should not display modal content when open is false', () => {
      // Given the CreateGuideModal is rendered with open=false
      renderWithProviders({ open: false })

      // Then modal should not be visible
      expect(screen.queryByText('Crear guía')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Steps')).not.toBeInTheDocument()
      expect(screen.queryByText('Nombre de la persona')).not.toBeInTheDocument()
    })
  })
})