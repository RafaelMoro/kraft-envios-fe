import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CreateGuideDbModal } from '@/features/Guides-DB/CreateGuideDbModal'
import { QuoteUI } from '@/shared/types/quotes.types'
import { PackageDimensions } from '@/shared/types/guides.types'
import { mockMatchMedia, QueryMatchMedia } from '../../utils-test/mockWatchMedia'

const mockToggleModal = jest.fn()
const mockResetSelectedQuotes = jest.fn()
const mockResetCotization = jest.fn()

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

const mockDimensions: PackageDimensions = {
  length: '10',
  width: '10',
  height: '10',
  weight: '1',
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithProviders = (props: {
  open: boolean
  selectedQuotes: QuoteUI[]
  packageDimensions: PackageDimensions | null
}) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateGuideDbModal
        open={props.open}
        selectedQuotes={props.selectedQuotes}
        packageDimensions={props.packageDimensions}
        toggleModal={mockToggleModal}
        resetSelectedQuotes={mockResetSelectedQuotes}
        resetCotization={mockResetCotization}
      />
    </QueryClientProvider>,
  )
}

describe('CreateGuideDbModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia({ [QueryMatchMedia.isDesktop]: true })
  })

  describe('Given the modal is open and prerequisites are met', () => {
    it('When rendered, Then it shows the header, stepper, and origin step content', () => {
      renderWithProviders({
        open: true,
        selectedQuotes: [mockQuote],
        packageDimensions: mockDimensions,
      })

      expect(screen.getByText('Crear guía en Kraft')).toBeInTheDocument()
      expect(screen.getByText('Remitente')).toBeInTheDocument()
      expect(screen.getByText('Destinatario')).toBeInTheDocument()
      expect(screen.getByText('Paquete')).toBeInTheDocument()
      expect(screen.getByText('Confirmar')).toBeInTheDocument()
      expect(screen.getByText('Domicilio')).toBeInTheDocument()
    })
  })

  describe('Given the modal is closed', () => {
    it('When open is false, Then it does not render the modal body', () => {
      renderWithProviders({
        open: false,
        selectedQuotes: [mockQuote],
        packageDimensions: mockDimensions,
      })

      expect(screen.queryByText('Crear guía en Kraft')).not.toBeInTheDocument()
    })
  })

  describe('Given prerequisites are missing', () => {
    it('When no quote is selected, Then it shows the missing-quote blocking error', () => {
      renderWithProviders({
        open: true,
        selectedQuotes: [],
        packageDimensions: mockDimensions,
      })

      const alert = screen.getByTestId('guides-db-blocking-error')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/cotización/i)
    })

    it('When package dimensions are missing, Then it shows the missing-dimensions blocking error', () => {
      renderWithProviders({
        open: true,
        selectedQuotes: [mockQuote],
        packageDimensions: null,
      })

      const alert = screen.getByTestId('guides-db-blocking-error')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toMatch(/dimensiones/i)
    })
  })

  describe('Given the modal close action', () => {
    it('When user dismisses the modal, Then it calls the provided toggle handler', () => {
      renderWithProviders({
        open: true,
        selectedQuotes: [mockQuote],
        packageDimensions: mockDimensions,
      })

      const closeButton = screen.getByRole('button', { name: /cancelar|cerrar/i })
      closeButton.click()
      expect(mockToggleModal).toHaveBeenCalled()
    })

    it('When user dismisses the modal before success, Then it does NOT reset cotization', () => {
      renderWithProviders({
        open: true,
        selectedQuotes: [mockQuote],
        packageDimensions: mockDimensions,
      })

      const closeButton = screen.getByRole('button', { name: /cancelar|cerrar/i })
      closeButton.click()
      expect(mockResetCotization).not.toHaveBeenCalled()
    })
  })
})
