import { CompanyDetails } from "@/features/Login/Register/CompanyDetails"
import { CompanyDetailsForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

const CompanyDetailsWrapper = ({
  goNext,
  goPrev,
  updateCompanyDetails,
  companyDetails = null
}: {
  goNext: () => void
  goPrev: () => void
  updateCompanyDetails: (data: CompanyDetailsForm) => void
  companyDetails?: CompanyDetailsForm | null
}) => {
  const currentCompanyDetails = companyDetails ?? {
    companyName: '',
    address: '',
    postalCode: '',
    secondPhoneNumber: ''
  }
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <CompanyDetails
        goNext={goNext}
        goPrev={goPrev}
        updateCompanyDetails={updateCompanyDetails}
        companyDetails={currentCompanyDetails}
      />
    </AppRouterContextProviderMock>
  )
}

describe('CompanyDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Show company details form', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    expect(screen.getByText('Cuéntanos el nombre de tu compañía, su dirección y el código postal para empezar a trabajar juntos.')).toBeInTheDocument()
  })

  it('renders the form title and description', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByText(/cuéntanos el nombre de tu compañía/i)).toBeInTheDocument()
  })

  it('renders all form fields with correct labels', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    expect(screen.getByLabelText(/nombre de la compañia \(opcional\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dirección \(opcional\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/segundo número telefónico \(opcional\)/i)).toBeInTheDocument()
  })

  it('renders action buttons with correct text and attributes', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const backButton = screen.getByRole('button', { name: /regresar/i })
    expect(backButton).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /siguiente/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('populates form fields with provided company details', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()
    const companyDetails: CompanyDetailsForm = {
      companyName: "Test Company",
      address: "123 Test Street",
      postalCode: "1234",
      secondPhoneNumber: "5551234567"
    }

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
      companyDetails={companyDetails}
    />)

    expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument()
    expect(screen.getByDisplayValue("123 Test Street")).toBeInTheDocument()
    expect(screen.getByDisplayValue("1234")).toBeInTheDocument()
    expect(screen.getByDisplayValue("5551234567")).toBeInTheDocument()
  })

  it('handles null/undefined company details correctly', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()
    const companyDetails: CompanyDetailsForm = {
      companyName: null,
      address: null,
      postalCode: "1234",
      secondPhoneNumber: null
    }

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
      companyDetails={companyDetails}
    />)

    const companyNameInput = screen.getByLabelText(/nombre de la compañia/i)
    const addressInput = screen.getByLabelText(/dirección \(opcional\)/i)
    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)

    expect(companyNameInput).toHaveValue('')
    expect(addressInput).toHaveValue('')
    expect(secondPhoneInput).toHaveValue('')
  })

  it('submits form with valid data and calls callbacks', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(postalCodeInput, '12345')
    await user.click(submitButton)

    await waitFor(() => {
      expect(updateCompanyDetails).toHaveBeenCalledWith({
        companyName: '',
        address: '',
        postalCode: '12345',
        secondPhoneNumber: ''
      })
      expect(goNext).toHaveBeenCalledTimes(1)
    })
  })

  it('submits form with all optional fields populated', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const companyNameInput = screen.getByLabelText(/nombre de la compañia/i)
    const addressInput = screen.getByLabelText(/dirección \(opcional\)/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(companyNameInput, 'My Company')
    await user.type(addressInput, '456 Main St')
    await user.type(postalCodeInput, '56789')
    await user.type(secondPhoneInput, '5559876543')
    await user.click(submitButton)

    await waitFor(() => {
      expect(updateCompanyDetails).toHaveBeenCalledWith({
        companyName: 'My Company',
        address: '456 Main St',
        postalCode: '56789',
        secondPhoneNumber: '5559876543'
      })
      expect(goNext).toHaveBeenCalledTimes(1)
    })
  })

  it('calls goPrev when back button is clicked', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const backButton = screen.getByRole('button', { name: /regresar/i })
    await user.click(backButton)

    expect(goPrev).toHaveBeenCalledTimes(1)
  })

  it('shows validation error for empty postal code', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const submitButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la dirección postal es requerida/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for postal code with incorrect length (too short)', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(postalCodeInput, '1234')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la dirección postal debe tener 5 caracteres/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for postal code with incorrect length (too long)', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(postalCodeInput, '123456')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la dirección postal debe tener 5 caracteres/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for short company name when provided', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const companyNameInput = screen.getByLabelText(/nombre de la compañia/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(companyNameInput, 'A')
    await user.type(postalCodeInput, '1234')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el nombre de la compañia debe tener al menos 2 caracteres/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for short address when provided', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const addressInput = screen.getByLabelText(/dirección \(opcional\)/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(addressInput, 'A')
    await user.type(postalCodeInput, '1234')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/la dirección debe tener al menos 2 caracteres/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid second phone number format', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(secondPhoneInput, '555abc1234')
    await user.type(postalCodeInput, '1234')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el teléfono solo puede contener dígitos/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('shows validation error for second phone number with incorrect length', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /siguiente/i })

    await user.type(secondPhoneInput, '123456789')
    await user.type(postalCodeInput, '1234')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument()
    })

    expect(updateCompanyDetails).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it('allows user to type in all form fields', async () => {
    const user = userEvent.setup()
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const companyNameInput = screen.getByLabelText(/nombre de la compañia/i)
    const addressInput = screen.getByLabelText(/dirección \(opcional\)/i)
    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)

    await user.type(companyNameInput, 'Test Corp')
    await user.type(addressInput, '789 Business Ave')
    await user.type(postalCodeInput, '9876')
    await user.type(secondPhoneInput, '5554567890')

    expect(companyNameInput).toHaveValue('Test Corp')
    expect(addressInput).toHaveValue('789 Business Ave')
    expect(postalCodeInput).toHaveValue('9876')
    expect(secondPhoneInput).toHaveValue('5554567890')
  })

  it('numeric input fields have correct input mode', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const secondPhoneInput = screen.getByLabelText(/segundo número telefónico/i)

    expect(postalCodeInput).toHaveAttribute('inputMode', 'numeric')
    expect(secondPhoneInput).toHaveAttribute('inputMode', 'numeric')
  })

  it('form fields have correct test ids', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    expect(screen.getByTestId('companyName')).toBeInTheDocument()
    expect(screen.getByTestId('postalCode')).toBeInTheDocument()
    expect(screen.getByTestId('secondPhoneNumber')).toBeInTheDocument()
  })
})