import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { PersonalInformation } from "@/features/Login/Register/PersonalInformation"
import { PersonalInformationForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"
import { LOGIN_ROUTE } from "@/shared/constants/global.constants"

const PersonalInformationWrapper = ({
  goNext,
  updatePersonalInformation,
  personalInformation = null
}: {
  goNext: () => void
  updatePersonalInformation: (data: PersonalInformationForm) => void
  personalInformation?: PersonalInformationForm | null
}) => {
  const currentPersonalInformation = personalInformation ?? {
    name: "",
    lastName: "",
    phone: ""
  }
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <PersonalInformation
        goNext={goNext}
        updatePersonalInformation={updatePersonalInformation}
        personalInformation={currentPersonalInformation}
      />
    </AppRouterContextProviderMock>
  )
}

describe('PersonalInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Show personal information form', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    expect(screen.getByTestId('firstName')).toBeInTheDocument()
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByTestId('phone')).toBeInTheDocument()
  })

  it('renders the form title and description', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByText(/llene la siguiente información para crear su cuenta/i)).toBeInTheDocument()
  })

  it('renders all form fields with correct labels', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
  })

  it('renders action buttons with correct text and attributes', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const backLink = screen.getByRole('link', { name: /volver/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', LOGIN_ROUTE)

    const submitButton = screen.getByRole('button', { name: /siguiente/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('populates form fields with provided personal information', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    const personalInfo: PersonalInformationForm = {
      name: "John",
      lastName: "Doe", 
      phone: "1234567890"
    }

    render(
      <PersonalInformationWrapper 
        goNext={mockGoNext} 
        updatePersonalInformation={mockUpdatePersonalInformation}
        personalInformation={personalInfo}
      />
    )

    expect(screen.getByDisplayValue("John")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument()
    expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument()
  })

  it('handles empty phone field correctly', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    const personalInfo: PersonalInformationForm = {
      name: "John",
      lastName: "Doe",
      phone: ""
    }

    render(
      <PersonalInformationWrapper 
        goNext={mockGoNext} 
        updatePersonalInformation={mockUpdatePersonalInformation}
        personalInformation={personalInfo}
      />
    )

    const phoneInput = screen.getByLabelText(/teléfono/i)
    expect(phoneInput).toHaveValue('')
  })

  it('submits form with valid data and calls callbacks', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.type(phoneInput, '1234567890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdatePersonalInformation).toHaveBeenCalledWith({
        name: 'John',
        lastName: 'Doe',
        phone: '1234567890'
      })
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })

  it('shows validation error for empty name field', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(lastNameInput, 'Doe')
    await user.type(phoneInput, '1234567890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for empty lastName field', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(phoneInput, '1234567890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/apellido es requerido/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for empty phone field', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el teléfono es requerido/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for short name', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'J')
    await user.type(lastNameInput, 'Doe')
    await user.type(phoneInput, '1234567890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for short lastName', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(lastNameInput, 'D')
    await user.type(phoneInput, '1234567890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el apellido debe tener al menos 2 caracteres/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid phone format', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.type(phoneInput, '123abc7890')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el teléfono solo puede contener dígitos/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('shows validation error for phone with incorrect length', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(nameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.type(phoneInput, '123456789')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument()
    })

    expect(mockUpdatePersonalInformation).not.toHaveBeenCalled()
    expect(mockGoNext).not.toHaveBeenCalled()
  })

  it('allows user to type in all form fields', async () => {
    const user = userEvent.setup()
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const nameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByLabelText(/teléfono/i)

    await user.type(nameInput, 'Jane')
    await user.type(lastNameInput, 'Smith')
    await user.type(phoneInput, '9876543210')

    expect(nameInput).toHaveValue('Jane')
    expect(lastNameInput).toHaveValue('Smith')
    expect(phoneInput).toHaveValue('9876543210')
  })

  it('phone input has numeric input mode', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()

    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    const phoneInput = screen.getByLabelText(/teléfono/i)
    expect(phoneInput).toHaveAttribute('inputMode', 'numeric')
  })
})