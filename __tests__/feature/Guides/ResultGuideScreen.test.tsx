import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultGuideScreen } from '@/features/Guides/ResultGuideScreen'
import { MnGuide } from '@/shared/types/guides.types'

// Mock functions for props
const mockCloseModal = jest.fn()

// Mock data for testing
const mockGuide: MnGuide = {
  token: 'test-token-123',
  tracking_number: 'KF123456789',
  carrier: 'DHL Express',
  tracking_status: null,
  price: '250.50',
  waybill: null,
  label_url: 'https://example.com/label.pdf',
  cancellable: true,
  created_at: '2024-01-15T10:30:00Z',
  label_status: 'ready'
}

const defaultProps = {
  guide: mockGuide,
  isSuccess: true,
  isError: false,
  closeModal: mockCloseModal
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ResultGuideScreen {...mergedProps} />)
}

describe('ResultGuideScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful guide creation display', () => {
    it('should display success title and guide information when guide creation is successful', () => {
      // Given the ResultGuideScreen is rendered with success state and guide data
      renderComponent()

      // Then success title should be displayed
      expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument()

      // Then guide information should be displayed correctly
      expect(screen.getByText('Número de guía: KF123456789')).toBeInTheDocument()
      expect(screen.getByText('DHL Express')).toBeInTheDocument()
      expect(screen.getByText('$250.50')).toBeInTheDocument()

      // Then label link should be present with correct attributes
      const labelLink = screen.getByText('Ver etiqueta')
      expect(labelLink).toBeInTheDocument()
      expect(labelLink.closest('a')).toHaveAttribute('href', 'https://example.com/label.pdf')
      expect(labelLink.closest('a')).toHaveAttribute('target', '_blank')
      expect(labelLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')

      // Then Finalizar button should be present
      const finalizarButton = screen.getByRole('button', { name: 'Finalizar' })
      expect(finalizarButton).toBeInTheDocument()
      expect(finalizarButton).not.toHaveClass('text-red-600') // Should not be red for success state
    })

    it('should display icons for each guide information section', () => {
      // Given the ResultGuideScreen is rendered with success state
      renderComponent()

      // Then all guide information sections should be present
      const trackingSection = screen.getByText('Número de guía: KF123456789').closest('div')
      const carrierSection = screen.getByText('DHL Express').closest('div')
      const priceSection = screen.getByText('$250.50').closest('div')
      const labelSection = screen.getByText('Ver etiqueta').closest('div')

      // Then each section should have the inline-flex gap-2 styling
      expect(trackingSection).toHaveClass('inline-flex', 'gap-2')
      expect(carrierSection).toHaveClass('inline-flex', 'gap-2')
      expect(priceSection).toHaveClass('inline-flex', 'gap-2')
      expect(labelSection).toHaveClass('inline-flex', 'gap-2')
    })
  })
})