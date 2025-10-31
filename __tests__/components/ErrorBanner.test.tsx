import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBanner } from '@/shared/ui/atoms/ErrorBanner'

describe('ErrorBanner', () => {
  const mockToggleError = jest.fn()
  
  const defaultProps = {
    message: 'This is an error message',
    toggleError: mockToggleError
  }

  const renderComponent = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props }
    return render(<ErrorBanner {...mergedProps} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial component rendering', () => {
    it('GIVEN ErrorBanner component WHEN it renders THEN it should display the error message', () => {
      // Given the ErrorBanner is rendered with a message
      renderComponent()

      // Then the error message should be displayed
      expect(screen.getByText('This is an error message')).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN it should display error warning icon', () => {
      // Given the ErrorBanner is rendered
      renderComponent()

      // Then the error warning icon should be displayed
      const errorIcon = document.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN it should display close button', () => {
      // Given the ErrorBanner is rendered
      renderComponent()

      // Then the close button should be displayed
      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN it should have correct styling classes', () => {
      // Given the ErrorBanner is rendered
      const { container } = renderComponent()

      // Then the container should have correct CSS classes for error styling
      const errorBanner = container.firstChild
      expect(errorBanner).toHaveClass('flex', 'justify-between', 'p-2', 'border', 'border-red-500', 'bg-red-100', 'rounded-full')
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN it should have proper structure', () => {
      // Given the ErrorBanner is rendered
      const { container } = renderComponent()

      // Then the component should contain the message and close button
      const errorBanner = container.firstChild
      expect(errorBanner).toContainElement(screen.getByText('This is an error message'))
      expect(errorBanner).toContainElement(screen.getByRole('button'))
    })
  })

  describe('Message display functionality', () => {
    it('GIVEN ErrorBanner with custom message WHEN it renders THEN it should display the custom message', () => {
      // Given the ErrorBanner is rendered with a custom message
      const customMessage = 'Custom error occurred'
      renderComponent({ message: customMessage })

      // Then the custom message should be displayed
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner with empty message WHEN it renders THEN it should display empty content', () => {
      // Given the ErrorBanner is rendered with an empty message
      const { container } = renderComponent({ message: '' })

      // Then the paragraph element should be present but empty
      const messageElement = container.querySelector('p')
      expect(messageElement).toBeInTheDocument()
      expect(messageElement).toBeEmptyDOMElement()
    })

    it('GIVEN ErrorBanner with long message WHEN it renders THEN it should display the full message', () => {
      // Given the ErrorBanner is rendered with a long message
      const longMessage = 'This is a very long error message that contains multiple words and should be displayed completely without truncation in the error banner component'
      renderComponent({ message: longMessage })

      // Then the full long message should be displayed
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner with special characters WHEN it renders THEN it should display message with special characters', () => {
      // Given the ErrorBanner is rendered with special characters in message
      const specialMessage = 'Error: Failed to connect! @#$%^&*()_+-={}[]|\\:";\'<>?,./'
      renderComponent({ message: specialMessage })

      // Then the message with special characters should be displayed
      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner with HTML content WHEN it renders THEN it should display content as plain text', () => {
      // Given the ErrorBanner is rendered with HTML content in message
      const htmlMessage = '<div>Error with <strong>HTML</strong> content</div>'
      renderComponent({ message: htmlMessage })

      // Then the HTML should be displayed as plain text, not rendered as HTML
      expect(screen.getByText(htmlMessage)).toBeInTheDocument()
      expect(screen.queryByText('HTML')).not.toBeInTheDocument()
    })
  })

  describe('Close button functionality', () => {
    it('GIVEN ErrorBanner component WHEN close button is clicked THEN toggleError function should be called', async () => {
      // Given the ErrorBanner is rendered
      const user = userEvent.setup()
      renderComponent()

      // When the close button is clicked
      const closeButton = screen.getByRole('button')
      await user.click(closeButton)

      // Then the toggleError function should be called
      expect(mockToggleError).toHaveBeenCalledTimes(1)
    })

    it('GIVEN ErrorBanner component WHEN close button is clicked multiple times THEN toggleError function should be called multiple times', async () => {
      // Given the ErrorBanner is rendered
      const user = userEvent.setup()
      renderComponent()

      // When the close button is clicked multiple times
      const closeButton = screen.getByRole('button')
      await user.click(closeButton)
      await user.click(closeButton)
      await user.click(closeButton)

      // Then the toggleError function should be called three times
      expect(mockToggleError).toHaveBeenCalledTimes(3)
    })

    it('GIVEN ErrorBanner component WHEN close button is clicked THEN toggleError function should be called with event object', async () => {
      // Given the ErrorBanner is rendered
      const user = userEvent.setup()
      renderComponent()

      // When the close button is clicked
      const closeButton = screen.getByRole('button')
      await user.click(closeButton)

      // Then the toggleError function should be called with click event
      expect(mockToggleError).toHaveBeenCalledTimes(1)
      expect(mockToggleError).toHaveBeenCalledWith(expect.any(Object))
    })

    it('GIVEN ErrorBanner component WHEN close button has focus and Enter is pressed THEN toggleError function should be called', async () => {
      // Given the ErrorBanner is rendered and close button has focus
      const user = userEvent.setup()
      renderComponent()

      // When the close button is focused and Enter key is pressed
      const closeButton = screen.getByRole('button')
      closeButton.focus()
      await user.keyboard('{Enter}')

      // Then the toggleError function should be called
      expect(mockToggleError).toHaveBeenCalledTimes(1)
    })

    it('GIVEN ErrorBanner component WHEN close button has focus and Space is pressed THEN toggleError function should be called', async () => {
      // Given the ErrorBanner is rendered and close button has focus
      const user = userEvent.setup()
      renderComponent()

      // When the close button is focused and Space key is pressed
      const closeButton = screen.getByRole('button')
      closeButton.focus()
      await user.keyboard(' ')

      // Then the toggleError function should be called
      expect(mockToggleError).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('GIVEN ErrorBanner component WHEN it renders THEN close button should be accessible', () => {
      // Given the ErrorBanner is rendered
      renderComponent()

      // Then the close button should be accessible via role
      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN it should have proper text content structure', () => {
      // Given the ErrorBanner is rendered
      renderComponent()

      // Then the message should be contained in a paragraph element
      const messageElement = screen.getByText('This is an error message')
      expect(messageElement.tagName).toBe('P')
    })

    it('GIVEN ErrorBanner component WHEN it renders THEN icons should be present for visual indication', () => {
      // Given the ErrorBanner is rendered
      const { container } = renderComponent()

      // Then both warning and close icons should be present
      const icons = container.querySelectorAll('svg')
      expect(icons).toHaveLength(2) // Warning icon and close icon
    })
  })

  describe('Props validation', () => {
    it('GIVEN ErrorBanner with different toggleError function WHEN close button is clicked THEN the correct function should be called', async () => {
      // Given the ErrorBanner is rendered with a different toggleError function
      const differentToggleError = jest.fn()
      const user = userEvent.setup()
      renderComponent({ toggleError: differentToggleError })

      // When the close button is clicked
      const closeButton = screen.getByRole('button')
      await user.click(closeButton)

      // Then the different toggleError function should be called
      expect(differentToggleError).toHaveBeenCalledTimes(1)
      expect(mockToggleError).not.toHaveBeenCalled()
    })

    it('GIVEN ErrorBanner with numeric message WHEN it renders THEN it should display the numeric message as string', () => {
      // Given the ErrorBanner is rendered with a numeric message
      renderComponent({ message: '404' })

      // Then the numeric message should be displayed as string
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})