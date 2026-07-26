import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultCard } from '@/features/Login/Register/ResultCard'
import { LOGIN_ROUTE } from '@/shared/constants/global.constants'
import { SUCCESS_CREATE_USER_TITLE, SUCCESS_CREATE_USER_SPAN, SUCCESS_CREATE_USER_MESSAGE } from '@/shared/constants/login.constants'

const ResultCardWrapper = ({ 
  title, 
  message, 
  isError, 
  resetStep 
}: { 
  title: string
  message: string
  isError: boolean
  resetStep: () => void
}) => {
  return (
    <ResultCard 
      title={title}
      message={message}
      isError={isError}
      resetStep={resetStep}
    />
  )
}

describe('ResultCard', () => {
  const mockResetStep = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Success state', () => {
    it('renders success card with correct title and message', () => {
      render(
        <ResultCardWrapper
          title="Success Title"
          message="Success message"
          isError={false}
          resetStep={mockResetStep}
        />
      )

      // Should render the predefined success title and span
      expect(screen.getByText(SUCCESS_CREATE_USER_TITLE)).toBeInTheDocument()
      expect(screen.getByText(SUCCESS_CREATE_USER_SPAN)).toBeInTheDocument()
      
      // Should render the predefined success message
      expect(screen.getByText(SUCCESS_CREATE_USER_MESSAGE)).toBeInTheDocument()
      
      // Should have link button to return to login
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', LOGIN_ROUTE)
    })

    it('does not render retry button in success state', () => {
      render(
        <ResultCardWrapper
          title="Success Title"
          message="Success message"
          isError={false}
          resetStep={mockResetStep}
        />
      )

      expect(screen.queryByRole('button', { name: /volver a intentar/i })).not.toBeInTheDocument()
    })

    it('renders single link button in success state', () => {
      render(
        <ResultCardWrapper
          title="Success Title"
          message="Success message"
          isError={false}
          resetStep={mockResetStep}
        />
      )

      const linkButtons = screen.getAllByRole('link')
      expect(linkButtons).toHaveLength(1)
      expect(linkButtons[0]).toHaveTextContent('Iniciar sesión')
    })
  })

  describe('Error state', () => {
    it('renders error card with provided title and message', () => {
      const errorTitle = 'Error occurred'
      const errorMessage = 'Something went wrong'

      render(
        <ResultCardWrapper
          title={errorTitle}
          message={errorMessage}
          isError={true}
          resetStep={mockResetStep}
        />
      )

      expect(screen.getByText(errorTitle)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('renders both return and retry buttons in error state', () => {
      render(
        <ResultCardWrapper
          title="Error Title"
          message="Error message"
          isError={true}
          resetStep={mockResetStep}
        />
      )

      // Should have link button to return to login
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', LOGIN_ROUTE)
      
      // Should have retry button
      expect(screen.getByRole('button', { name: /volver a intentar/i })).toBeInTheDocument()
    })

    it('calls resetStep when retry button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ResultCardWrapper
          title="Error Title"
          message="Error message"
          isError={true}
          resetStep={mockResetStep}
        />
      )

      const retryButton = screen.getByRole('button', { name: /volver a intentar/i })
      await user.click(retryButton)

      expect(mockResetStep).toHaveBeenCalledTimes(1)
    })

    it('renders link button with secondary type in error state', () => {
      render(
        <ResultCardWrapper
          title="Error Title"
          message="Error message"
          isError={true}
          resetStep={mockResetStep}
        />
      )

      const linkButton = screen.getByRole('link', { name: /iniciar sesión/i })
      // Check for secondary button styling classes
      expect(linkButton).toHaveClass('border', 'border-primary-700', 'text-primary-700')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure in error state', () => {
      render(
        <ResultCardWrapper
          title="Error Title"
          message="Error message"
          isError={true}
          resetStep={mockResetStep}
        />
      )

      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Error Title')
    })

    it('has proper heading structure in success state', () => {
      render(
        <ResultCardWrapper
          title="Success Title"
          message="Success message"
          isError={false}
          resetStep={mockResetStep}
        />
      )

      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(SUCCESS_CREATE_USER_TITLE)
    })

    it('has accessible button and link elements', () => {
      render(
        <ResultCardWrapper
          title="Error Title"
          message="Error message"
          isError={true}
          resetStep={mockResetStep}
        />
      )

      // Check that interactive elements are accessible
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /volver a intentar/i })).toBeInTheDocument()
    })
  })

  describe('Text content', () => {
    it('displays custom error title and message correctly', () => {
      const customTitle = 'Custom Error Title'
      const customMessage = 'This is a custom error message for testing purposes'

      render(
        <ResultCardWrapper
          title={customTitle}
          message={customMessage}
          isError={true}
          resetStep={mockResetStep}
        />
      )

      expect(screen.getByText(customTitle)).toBeInTheDocument()
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('ignores custom title and message in success state', () => {
      const customTitle = 'Custom Success Title'
      const customMessage = 'This should not appear'

      render(
        <ResultCardWrapper
          title={customTitle}
          message={customMessage}
          isError={false}
          resetStep={mockResetStep}
        />
      )

      // Should not display custom props in success state
      expect(screen.queryByText(customTitle)).not.toBeInTheDocument()
      expect(screen.queryByText(customMessage)).not.toBeInTheDocument()
      
      // Should display predefined success content
      expect(screen.getByText(SUCCESS_CREATE_USER_TITLE)).toBeInTheDocument()
      expect(screen.getByText(SUCCESS_CREATE_USER_MESSAGE)).toBeInTheDocument()
    })
  })
})
