import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { UserRegistration } from "@/features/Login/Register/UserRegistration"
import { UserPasswordForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock"

const UserRegistrationWrapper = ({
  isLoading,
  goPrev,
  submitForm,
  updateUserPasswordInfo
}: {
  isLoading: boolean
  goPrev: () => void
  submitForm: () => void
  updateUserPasswordInfo: (data: UserPasswordForm) => void
}) => {
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <UserRegistration
        isLoading={isLoading}
        goPrev={goPrev}
        submitForm={submitForm}
        updateUserPasswordInfo={updateUserPasswordInfo}
      />
    </AppRouterContextProviderMock>
  )
}

describe('UserRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Show user registration form', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument()
  })

  it('renders the form title and description', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByText(/ingrese su correo electronico y contraseña/i)).toBeInTheDocument()
  })

  it('renders all form fields with correct labels', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
  })

  it('renders action buttons with correct text and attributes', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const backButton = screen.getByRole('button', { name: /regresar/i })
    expect(backButton).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(submitButton).not.toBeDisabled()
  })

  it('calls goPrev when back button is clicked', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const backButton = screen.getByRole('button', { name: /regresar/i })
    await user.click(backButton)

    expect(mockGoPrev).toHaveBeenCalledTimes(1)
  })

  it('submits form with valid data and calls callbacks', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const validPassword = 'ValidPassword123!@#'
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, validPassword)
    await user.type(confirmPasswordInput, validPassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUserPasswordInfo).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: validPassword,
        confirmPassword: validPassword
      })
      expect(mockSubmitForm).toHaveBeenCalledTimes(1)
    })
  })

  it('shows validation error for empty email field', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const validPassword = 'ValidPassword123!@#'
    await user.type(passwordInput, validPassword)
    await user.type(confirmPasswordInput, validPassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/por favor, ingrese su correo electrónico/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const validPassword = 'ValidPassword123!@#'
    await user.type(emailInput, 'notanemail@a')
    await user.type(passwordInput, validPassword)
    await user.type(confirmPasswordInput, validPassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Correo electrónico inválido')).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for empty password field', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(confirmPasswordInput, 'SomePassword123!')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/por favor, ingrese una contraseña/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for password too short', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const shortPassword = 'Short1!'
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, shortPassword)
    await user.type(confirmPasswordInput, shortPassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener al menos 16 caracteres/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for password missing uppercase', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const noUppercasePassword = 'validpassword123!@#'
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, noUppercasePassword)
    await user.type(confirmPasswordInput, noUppercasePassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe contener al menos 1 mayúscula/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for password missing special character', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    const noSpecialCharPassword = 'ValidPassword123'
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, noSpecialCharPassword)
    await user.type(confirmPasswordInput, noSpecialCharPassword)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe contener al menos 1 caracter especial/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows validation error for mismatched passwords', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'ValidPassword123!@#')
    await user.type(confirmPasswordInput, 'DifferentPassword123!@#')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/contraseña y confirmar contraseña deben ser iguales/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPasswordInfo).not.toHaveBeenCalled()
    expect(mockSubmitForm).not.toHaveBeenCalled()
  })

  it('shows loading state when isLoading is true', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={true}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByText(/creando usuario.../i)).toBeInTheDocument()
    expect(screen.getByLabelText(/loading creating user/i)).toBeInTheDocument()
    
    const submitButton = screen.getByRole('button', { name: /creando usuario.../i })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows normal state when isLoading is false', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.queryByText(/creando usuario.../i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/loading creating user/i)).not.toBeInTheDocument()
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(submitButton).not.toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-disabled', 'false')
  })

  it('allows user to type in all form fields', async () => {
    const user = userEvent.setup()
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')

    await user.type(emailInput, 'user@example.com')
    await user.type(passwordInput, 'MySecurePassword123!')
    await user.type(confirmPasswordInput, 'MySecurePassword123!')

    expect(emailInput).toHaveValue('user@example.com')
    expect(passwordInput).toHaveValue('MySecurePassword123!')
    expect(confirmPasswordInput).toHaveValue('MySecurePassword123!')
  })

  it('form fields have correct input types', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })

  it('form fields have correct test ids', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument()
  })
})