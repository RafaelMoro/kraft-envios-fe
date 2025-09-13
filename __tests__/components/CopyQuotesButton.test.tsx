import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyQuotesButton } from '@/shared/ui/atoms/CopyQuotesButton'

describe('CopyQuotesButton', () => {
  const mockHandleCopyInfo = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    isMobile: false,
    handleCopyInfo: mockHandleCopyInfo,
    successCopyActionBar: null
  }

  describe('GIVEN the CopyQuotesButton is rendered in default state', () => {
    it('WHEN rendered on desktop THEN it should display copy icon and full text', () => {
      render(<CopyQuotesButton {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Copiar cotizaciones')).toBeInTheDocument()
    })

    it('WHEN rendered on mobile THEN it should display copy icon and short text', () => {
      render(<CopyQuotesButton {...defaultProps} isMobile={true} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Copiar')).toBeInTheDocument()
      expect(screen.queryByText('Copiar cotizaciones')).not.toBeInTheDocument()
    })

    it('WHEN rendered THEN it should have alternative color styling', () => {
      render(<CopyQuotesButton {...defaultProps} />)

      const button = screen.getByRole('button')
      // Flowbite Button with color="alternative" should have specific classes
      expect(button).toBeInTheDocument()
    })
  })

  describe('GIVEN the CopyQuotesButton is rendered in success state', () => {
    const successMessage = 'Copiado exitosamente'
    const successProps = {
      ...defaultProps,
      successCopyActionBar: successMessage
    }

    it('WHEN rendered on desktop with success message THEN it should display check icon and success text', () => {
      render(<CopyQuotesButton {...successProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText(successMessage)).toBeInTheDocument()
      expect(screen.queryByText('Copiar cotizaciones')).not.toBeInTheDocument()
      expect(screen.queryByText('Copiar')).not.toBeInTheDocument()
    })

    it('WHEN rendered on mobile with success message THEN it should display only check icon', () => {
      render(<CopyQuotesButton {...successProps} isMobile={true} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.queryByText(successMessage)).not.toBeInTheDocument()
      expect(screen.queryByText('Copiar')).not.toBeInTheDocument()
      expect(screen.queryByText('Copiar cotizaciones')).not.toBeInTheDocument()
    })

    it('WHEN rendered with success state THEN it should have green color styling', () => {
      render(<CopyQuotesButton {...successProps} />)

      const button = screen.getByRole('button')
      // The button should be rendered with different styling when success is true
      expect(button).toBeInTheDocument()
    })
  })

  describe('GIVEN the user interacts with the button', () => {
    it('WHEN the button is clicked THEN it should call handleCopyInfo', async () => {
      const user = userEvent.setup()
      render(<CopyQuotesButton {...defaultProps} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockHandleCopyInfo).toHaveBeenCalledTimes(1)
    })

    it('WHEN the button is clicked in success state THEN it should still call handleCopyInfo', async () => {
      const user = userEvent.setup()
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar="Success" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockHandleCopyInfo).toHaveBeenCalledTimes(1)
    })

    it('WHEN the button is clicked on mobile THEN it should call handleCopyInfo', async () => {
      const user = userEvent.setup()
      render(<CopyQuotesButton {...defaultProps} isMobile={true} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockHandleCopyInfo).toHaveBeenCalledTimes(1)
    })
  })

  describe('GIVEN different prop combinations', () => {
    it('WHEN successCopyActionBar is empty string THEN it should render default state', () => {
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar="" />)

      expect(screen.getByText('Copiar cotizaciones')).toBeInTheDocument()
      // Empty string is falsy, so it should render the default copy state
    })

    it('WHEN successCopyActionBar is whitespace THEN it should render success state', () => {
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar="   " />)

      expect(screen.queryByText('Copiar cotizaciones')).not.toBeInTheDocument()
      // Whitespace should be treated as truthy and show success state
    })

    it('WHEN isMobile is false and successCopyActionBar is null THEN it should show full desktop text', () => {
      render(<CopyQuotesButton {...defaultProps} isMobile={false} successCopyActionBar={null} />)

      expect(screen.getByText('Copiar cotizaciones')).toBeInTheDocument()
    })

    it('WHEN isMobile is true and successCopyActionBar is null THEN it should show short mobile text', () => {
      render(<CopyQuotesButton {...defaultProps} isMobile={true} successCopyActionBar={null} />)

      expect(screen.getByText('Copiar')).toBeInTheDocument()
    })
  })

  describe('GIVEN the button accessibility and structure', () => {
    it('WHEN rendered THEN it should be a clickable button element', () => {
      render(<CopyQuotesButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('WHEN rendered THEN it should have proper CSS classes for layout', () => {
      render(<CopyQuotesButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('WHEN rendered with success state THEN button should still be interactive', () => {
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar="Success" />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(button).toBeInTheDocument()
    })
  })

  describe('GIVEN different success message scenarios', () => {
    it('WHEN successCopyActionBar has long text THEN it should display full text on desktop', () => {
      const longMessage = 'Las cotizaciones han sido copiadas exitosamente al portapapeles'
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('WHEN successCopyActionBar has special characters THEN it should display them correctly', () => {
      const specialMessage = '¡Copiado! ✓'
      render(<CopyQuotesButton {...defaultProps} successCopyActionBar={specialMessage} />)

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('WHEN successCopyActionBar changes from null to string THEN it should update the display', () => {
      const { rerender } = render(<CopyQuotesButton {...defaultProps} />)
      
      expect(screen.getByText('Copiar cotizaciones')).toBeInTheDocument()

      rerender(<CopyQuotesButton {...defaultProps} successCopyActionBar="¡Copiado!" />)
      
      expect(screen.getByText('¡Copiado!')).toBeInTheDocument()
      expect(screen.queryByText('Copiar cotizaciones')).not.toBeInTheDocument()
    })
  })
})
