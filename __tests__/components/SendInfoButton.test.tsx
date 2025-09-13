import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SendInfoButton } from '@/shared/ui/atoms/SendInfoButton'

describe('SendInfoButton', () => {
  const mockHandleSendInfo = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    isMobile: false,
    handleSendInfo: mockHandleSendInfo
  }

  describe('GIVEN the user interacts with the button', () => {
    it('WHEN the button is clicked THEN it should call handleSendInfo', async () => {
      const user = userEvent.setup()
      render(<SendInfoButton {...defaultProps} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockHandleSendInfo).toHaveBeenCalledTimes(1)
    })
  })

  describe('GIVEN different prop combinations', () => {
    it('WHEN isPrimary is undefined THEN it should render with default styling', () => {
      render(<SendInfoButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Mandar información')).toBeInTheDocument()
    })
  })

  describe('GIVEN different text display scenarios', () => {
    it('WHEN switching from desktop to mobile THEN text should change accordingly', () => {
      const { rerender } = render(<SendInfoButton {...defaultProps} isMobile={false} />)
      
      expect(screen.getByText('Mandar información')).toBeInTheDocument()

      rerender(<SendInfoButton {...defaultProps} isMobile={true} />)
      
      expect(screen.getByText('Mandar')).toBeInTheDocument()
      expect(screen.queryByText('Mandar información')).not.toBeInTheDocument()
    })

    it('WHEN switching from mobile to desktop THEN text should change accordingly', () => {
      const { rerender } = render(<SendInfoButton {...defaultProps} isMobile={true} />)
      
      expect(screen.getByText('Mandar')).toBeInTheDocument()

      rerender(<SendInfoButton {...defaultProps} isMobile={false} />)
      
      expect(screen.getByText('Mandar información')).toBeInTheDocument()
      expect(screen.queryByText('Mandar')).not.toBeInTheDocument()
    })

    it('WHEN switching from primary to alternative styling THEN button should remain functional', () => {
      const { rerender } = render(<SendInfoButton {...defaultProps} isPrimary={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      rerender(<SendInfoButton {...defaultProps} isPrimary={false} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Mandar información')).toBeInTheDocument()
    })
  })

  describe('GIVEN multiple click interactions', () => {
    it('WHEN the button is clicked multiple times THEN it should call handleSendInfo each time', async () => {
      const user = userEvent.setup()
      render(<SendInfoButton {...defaultProps} />)

      const button = screen.getByRole('button')
      
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockHandleSendInfo).toHaveBeenCalledTimes(3)
    })

    it('WHEN the button is clicked with different prop combinations THEN it should always call handleSendInfo', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SendInfoButton {...defaultProps} />)

      const button = screen.getByRole('button')
      await user.click(button)
      expect(mockHandleSendInfo).toHaveBeenCalledTimes(1)

      rerender(<SendInfoButton {...defaultProps} isMobile={true} isPrimary={true} />)
      
      const newButton = screen.getByRole('button')
      await user.click(newButton)
      expect(mockHandleSendInfo).toHaveBeenCalledTimes(2)
    })
  })
})
