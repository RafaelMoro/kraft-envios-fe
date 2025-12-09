import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { PersonalDataMn } from '@/features/Guides/Mn/PersonalDataMn'

type TestFormData = {
  name: string
  lastName: string
  phone: string
  email?: string | null
  company?: string | null
}

// Test wrapper component to provide form context
const TestWrapper = ({ 
  defaultValues = {},
  onSubmit = jest.fn()
}: { 
  defaultValues?: Partial<TestFormData>
  onSubmit?: (data: TestFormData) => void
}) => {
  const { register, formState: { errors }, handleSubmit } = useForm<TestFormData>({
    defaultValues: {
      name: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      ...defaultValues
    }
  })

  const addressData: TestFormData = {
    name: defaultValues.name || '',
    lastName: defaultValues.lastName || '',
    phone: defaultValues.phone || '',
    email: defaultValues.email,
    company: defaultValues.company
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonalDataMn 
        addressData={addressData}
        errors={errors}
        register={register}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('Feature: Personal Data Form for Mn Guides', () => {
  describe('Scenario: Display all personal data fields', () => {
    it('Given the component renders, When displaying the form, Then it should show all input fields with correct labels', () => {
      // Given the component renders
      render(<TestWrapper />)

      // Then it should show all required fields
      expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^apellido$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^teléfono$/i)).toBeInTheDocument()
      
      // And it should show optional fields
      expect(screen.getByLabelText(/correo electrónico \(opcional\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre de la compañia \(opcional\)/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display default values in fields', () => {
    it('Given default values are provided, When the component renders, Then it should display those values in the inputs', () => {
      // Given default values are provided
      const defaultValues = {
        name: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: 'juan@example.com',
        company: 'Mi Empresa'
      }
      render(<TestWrapper defaultValues={defaultValues} />)

      // Then fields should show the default values
      expect(screen.getByTestId('name')).toHaveValue('Juan')
      expect(screen.getByTestId('lastName')).toHaveValue('Pérez')
      expect(screen.getByTestId('phone')).toHaveValue('5551234567')
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('juan@example.com')
      expect(screen.getByTestId('company')).toHaveValue('Mi Empresa')
    })
  })

  describe('Scenario: Handle empty optional fields', () => {
    it('Given optional fields are null or undefined, When the component renders, Then it should display empty strings', () => {
      // Given optional fields are null/undefined
      const defaultValues = {
        name: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: null,
        company: undefined
      }
      render(<TestWrapper defaultValues={defaultValues} />)

      // Then optional fields should be empty
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('')
      expect(screen.getByTestId('company')).toHaveValue('')
    })
  })

  describe('Scenario: User can type in all fields', () => {
    it('Given the component renders, When user types in each field, Then the values should update', async () => {
      // Given the component renders
      const user = userEvent.setup()
      render(<TestWrapper />)

      // When user types in name field
      const nameInput = screen.getByTestId('name')
      await user.type(nameInput, 'Carlos')
      expect(nameInput).toHaveValue('Carlos')

      // When user types in lastName field
      const lastNameInput = screen.getByTestId('lastName')
      await user.type(lastNameInput, 'García')
      expect(lastNameInput).toHaveValue('García')

      // When user types in phone field
      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, '5559876543')
      expect(phoneInput).toHaveValue('5559876543')

      // When user types in email field
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'carlos@example.com')
      expect(emailInput).toHaveValue('carlos@example.com')

      // When user types in company field
      const companyInput = screen.getByTestId('company')
      await user.type(companyInput, 'Tech Company')
      expect(companyInput).toHaveValue('Tech Company')
    })
  })

  describe('Scenario: Phone field has numeric input mode', () => {
    it('Given the component renders, When checking the phone field, Then it should have numeric input mode', () => {
      // Given the component renders
      render(<TestWrapper />)

      // Then phone field should have numeric inputMode
      const phoneInput = screen.getByTestId('phone')
      expect(phoneInput).toHaveAttribute('inputMode', 'numeric')
    })
  })

  describe('Scenario: Email field has email type', () => {
    it('Given the component renders, When checking the email field, Then it should have email type', () => {
      // Given the component renders
      render(<TestWrapper />)

      // Then email field should have type="email"
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Scenario: Fields use correct test IDs', () => {
    it('Given the component renders, When checking for test IDs, Then name, lastName, phone, and company should have test IDs', () => {
      // Given the component renders
      render(<TestWrapper />)

      // Then fields should have test IDs
      expect(screen.getByTestId('name')).toBeInTheDocument()
      expect(screen.getByTestId('lastName')).toBeInTheDocument()
      expect(screen.getByTestId('phone')).toBeInTheDocument()
      expect(screen.getByTestId('company')).toBeInTheDocument()
    })
  })

  describe('Scenario: Responsive grid layout', () => {
    it('Given the component renders, When checking the layout, Then it should use a responsive grid', () => {
      // Given the component renders
      const { container } = render(<TestWrapper />)

      // Then it should have grid layout classes
      const section = container.querySelector('section')
      expect(section).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-4')
    })
  })
})
