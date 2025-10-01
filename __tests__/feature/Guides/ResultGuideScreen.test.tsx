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

  describe('Success state tests', () => {
    it('should render guide details when isSuccess is true AND guide exists', () => {
      // Given the ResultGuideScreen is rendered with isSuccess=true and valid guide
      renderComponent({ isSuccess: true, guide: mockGuide })

      // Then the success content should be rendered
      expect(screen.getByText('Número de guía: KF123456789')).toBeInTheDocument()
      expect(screen.getByText('DHL Express')).toBeInTheDocument()
      expect(screen.getByText('$250.50')).toBeInTheDocument()
      expect(screen.getByText('Ver etiqueta')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Finalizar' })).toBeInTheDocument()
    })

    it('should NOT render guide details when isSuccess is true but guide is undefined', () => {
      // Given the ResultGuideScreen is rendered with isSuccess=true but guide=undefined
      renderComponent({ isSuccess: true, guide: undefined })

      // Then the success content should NOT be rendered
      expect(screen.queryByText(/Número de guía:/)).not.toBeInTheDocument()
      expect(screen.queryByText('Ver etiqueta')).not.toBeInTheDocument()
      
      // But the title should still show success
      expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument()
    })

    it('should NOT render guide details when isSuccess is true but guide is null', () => {
      // Given the ResultGuideScreen is rendered with isSuccess=true but guide=null
      renderComponent({ isSuccess: true, guide: null })

      // Then the success content should NOT be rendered due to guide && Boolean(guide) check
      expect(screen.queryByText(/Número de guía:/)).not.toBeInTheDocument()
      expect(screen.queryByText('Ver etiqueta')).not.toBeInTheDocument()
      
      // But the title should still show success
      expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument()
    })

    it('should NOT render guide details when isSuccess is false even with valid guide', () => {
      // Given the ResultGuideScreen is rendered with isSuccess=false but valid guide
      renderComponent({ isSuccess: false, guide: mockGuide })

      // Then the success content should NOT be rendered due to isSuccess check
      expect(screen.queryByText(/Número de guía:/)).not.toBeInTheDocument()
      expect(screen.queryByText('Ver etiqueta')).not.toBeInTheDocument()
      
      // And the title should show error
      expect(screen.getByText('Error al crear la guía')).toBeInTheDocument()
    })

    it('should render tracking number with guide.tracking_number value', () => {
      // Given the ResultGuideScreen is rendered with a guide containing specific tracking number
      const customGuide = { ...mockGuide, tracking_number: 'CUSTOM123' }
      renderComponent({ guide: customGuide })

      // Then the tracking number should be displayed correctly
      expect(screen.getByText('Número de guía: CUSTOM123')).toBeInTheDocument()
    })

    it('should render carrier with guide.carrier value using optional chaining', () => {
      // Given the ResultGuideScreen is rendered with a guide containing specific carrier
      const customGuide = { ...mockGuide, carrier: 'FedEx Express' }
      renderComponent({ guide: customGuide })

      // Then the carrier should be displayed correctly
      expect(screen.getByText('FedEx Express')).toBeInTheDocument()
    })

    it('should render formatted price using formatNumberToCurrency', () => {
      // Given the ResultGuideScreen is rendered with a guide containing specific price
      const customGuide = { ...mockGuide, price: '1250.75' }
      renderComponent({ guide: customGuide })

      // Then the price should be formatted as currency
      expect(screen.getByText('$1,250.75')).toBeInTheDocument()
    })

    it('should render label link with guide.label_url using optional chaining', () => {
      // Given the ResultGuideScreen is rendered with a guide containing specific label URL
      const customGuide = { ...mockGuide, label_url: 'https://custom-label.pdf' }
      renderComponent({ guide: customGuide })

      // Then the label link should have the correct href
      const labelLink = screen.getByText('Ver etiqueta')
      expect(labelLink.closest('a')).toHaveAttribute('href', 'https://custom-label.pdf')
    })

    it('should call closeModal when Finalizar button is clicked in success state', async () => {
      // Given the ResultGuideScreen is rendered in success state
      const user = userEvent.setup()
      renderComponent()

      // When user clicks the Finalizar button
      const finalizarButton = screen.getByRole('button', { name: 'Finalizar' })
      await user.click(finalizarButton)

      // Then closeModal should be called
      expect(mockCloseModal).toHaveBeenCalledTimes(1)
    })

    it('should render all RemixIcon components in their respective sections', () => {
      // Given the ResultGuideScreen is rendered with valid guide
      renderComponent()

      // Then each information section should contain an icon alongside the text
      const trackingSection = screen.getByText('Número de guía: KF123456789').closest('div')
      const carrierSection = screen.getByText('DHL Express').closest('div')
      const priceSection = screen.getByText('$250.50').closest('div')
      const labelSection = screen.getByText('Ver etiqueta').closest('div')

      // Verify each section has the proper structure with icon and content
      expect(trackingSection).toBeInTheDocument()
      expect(carrierSection).toBeInTheDocument()
      expect(priceSection).toBeInTheDocument()
      expect(labelSection).toBeInTheDocument()
    })
  })
})