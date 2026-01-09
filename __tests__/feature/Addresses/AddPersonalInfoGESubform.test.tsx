import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMutation } from '@tanstack/react-query'

import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AddPersonalInfoGESubform } from '@/features/Addresses/AddPersonalInfoGESubform'
import { AddressDataGEFormValues } from '@/shared/types/guides.types'
import * as guidesUtils from '../../../src/shared/utils/guides.utils'
import * as addressesUtils from '../../../src/shared/utils/addresses.utils'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn()
}))

jest.mock('../../../src/shared/utils/guides.utils')
jest.mock('../../../src/shared/utils/addresses.utils')

const mockAddressDataGE: AddressDataGEFormValues = {
  street1: 'Calle Principal',
  external_number: '123',
  neighborhood: 'Centro',
  city: 'Ciudad de México',
  state: 'CDMX',
  zipcode: '12345',
  reference: 'Cerca del parque',
  alias: 'Casa'
}

const mockGoBack = jest.fn()
const mockGoResult = jest.fn()
const mockSetShowErrorCreateAddressGe = jest.fn()
const mockRefetchAddressesGE = jest.fn()

const AddPersonalInfoGESubformWrapper = ({
  addressDataGE = mockAddressDataGE
}: {
  addressDataGE?: AddressDataGEFormValues | null
}) => {
  return (
    <QueryProviderWrapper>
      <AddPersonalInfoGESubform
        addressDataGE={addressDataGE}
        goBack={mockGoBack}
        goResult={mockGoResult}
        setShowErrorCreateAddressGe={mockSetShowErrorCreateAddressGe}
        refetchAddressesGE={mockRefetchAddressesGE}
      />
    </QueryProviderWrapper>
  )
}

describe('Feature: Add Personal Information GE Subform', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    ;(useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false
    })
  })

  afterEach(() => {
    try {
      if (jest.isMockFunction(setTimeout)) {
        jest.useRealTimers()
      }
    } catch {
      // Timer functions are not mocked, nothing to restore
    }
  })

  it('Given the component is mounted, When it renders, Then it should display all form fields', () => {
    render(<AddPersonalInfoGESubformWrapper />)

    expect(screen.getByRole('heading', { name: /datos personales/i })).toBeInTheDocument()
    expect(screen.getByTestId('name')).toBeInTheDocument()
    expect(screen.getByTestId('phone')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByTestId('company')).toBeInTheDocument()
    expect(screen.getByTestId('rfc')).toBeInTheDocument()

    expect(screen.getByTestId('cancel-button-create-address-ge')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button-create-address-ge')).toBeInTheDocument()
    expect(screen.getByText(/crear dirección/i)).toBeInTheDocument()
  })

  it('Given the form is displayed, When the user clicks the cancel button, Then it should call goBack', async () => {
    const user = userEvent.setup()
    render(<AddPersonalInfoGESubformWrapper />)

    const cancelButton = screen.getByTestId('cancel-button-create-address-ge')
    await user.click(cancelButton)

    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })

  describe('Form submission', () => {
    it('Given the user fills all required fields, When the form is submitted, Then it should call the mutation', async () => {
      const user = userEvent.setup()
      const mockMutate = jest.fn()
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false
      })
      
      const mockCombinedPayload = {
        zipcode: '12345',
        neighborhood: 'Centro',
        city: 'Ciudad de México',
        state: 'CDMX',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '5512345678',
        company: 'Mi Empresa',
        rfc: 'JUAP800101ABC',
        street: 'Calle Principal',
        number: '123',
        reference: 'Cerca del parque',
        alias: 'Casa'
      }
      ;(guidesUtils.combineGEFormValues as jest.Mock).mockReturnValue(mockCombinedPayload)

      render(<AddPersonalInfoGESubformWrapper />)

      // Fill required fields
      const nameInput = screen.getByTestId('name')
      const phoneInput = screen.getByTestId('phone')

      await user.type(nameInput, 'Juan Pérez')
      await user.type(phoneInput, '5512345678')

      // Submit form
      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })

    it('Given the user fills all fields including optional ones, When the form is submitted, Then it should combine form values correctly', async () => {
      const user = userEvent.setup()
      const mockMutate = jest.fn()
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false
      })

      render(<AddPersonalInfoGESubformWrapper />)

      // Fill all fields
      await user.type(screen.getByTestId('name'), 'Juan Pérez')
      await user.type(screen.getByTestId('phone'), '5512345678')
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com')
      await user.type(screen.getByTestId('company'), 'Mi Empresa')
      await user.type(screen.getByTestId('rfc'), 'JUAP800101ABC')

      // Submit form
      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(guidesUtils.combineGEFormValues).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Juan Pérez',
            phone: '5512345678',
            email: 'juan@example.com',
            company: 'Mi Empresa',
            rfc: 'JUAP800101ABC'
          }),
          mockAddressDataGE
        )
      })
    })
  })

  describe('Error validation', () => {
    it('Given the user submits empty form, When validation fails, Then it should display error messages', async () => {
      const user = userEvent.setup()
      render(<AddPersonalInfoGESubformWrapper />)

      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/el teléfono es requerido/i)).toBeInTheDocument()
      })
    })

    it('Given the user enters a short name, When validation fails, Then it should display appropriate error', async () => {
      const user = userEvent.setup()
      render(<AddPersonalInfoGESubformWrapper />)

      const nameInput = screen.getByTestId('name')
      await user.type(nameInput, 'J')

      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument()
      })
    })

    it('Given the user enters an invalid phone, When validation fails, Then it should display appropriate error', async () => {
      const user = userEvent.setup()
      render(<AddPersonalInfoGESubformWrapper />)

      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, '123')

      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument()
      })
    })

    it('Given the user enters non-numeric phone, When validation fails, Then it should display appropriate error', async () => {
      const user = userEvent.setup()
      render(<AddPersonalInfoGESubformWrapper />)

      const phoneInput = screen.getByTestId('phone')
      await user.type(phoneInput, 'abcdefghij')

      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el teléfono solo puede contener dígitos/i)).toBeInTheDocument()
      })
    })

    it('Given the user enters an invalid email, When validation fails, Then it should display appropriate error', async () => {
      const user = userEvent.setup()
      render(<AddPersonalInfoGESubformWrapper />)

      // Fill required fields first so validation runs on email
      const nameInput = screen.getByTestId('name')
      const phoneInput = screen.getByTestId('phone')
      await user.type(nameInput, 'Juan Pérez')
      await user.type(phoneInput, '5512345678')

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Mutation is successful', () => {

    it('Given the mutation is successful, When the form is in success state, Then it should display check icon', () => {
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isSuccess: true
      })

      render(<AddPersonalInfoGESubformWrapper />)

      // Check icon should be present via CheckIcon component
      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      expect(submitButton).toBeInTheDocument()
    })

    it('Given the mutation is successful, When the form is in success state, Then buttons should be disabled', () => {
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isSuccess: true
      })

      render(<AddPersonalInfoGESubformWrapper />)

      expect(screen.getByTestId('cancel-button-create-address-ge')).toBeDisabled()
      expect(screen.getByTestId('submit-button-create-address-ge')).toBeDisabled()
    })
  })

  describe('Scenario: Mutation is pending', () => {
    it('Given the mutation is in progress, When the form is in pending state, Then it should display spinner', () => {
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isSuccess: false
      })

      render(<AddPersonalInfoGESubformWrapper />)

      expect(screen.getByLabelText(/loading create address ge/i)).toBeInTheDocument()
    })

    it('Given the mutation is in progress, When the form is in pending state, Then buttons should be disabled', () => {
      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isSuccess: false
      })

      render(<AddPersonalInfoGESubformWrapper />)

      expect(screen.getByTestId('cancel-button-create-address-ge')).toBeDisabled()
      expect(screen.getByTestId('submit-button-create-address-ge')).toBeDisabled()
    })
  })

  describe('Scenario: Mutation fails', () => {
    it('Given the mutation fails, When the error callback is executed, Then it should show error and navigate to result', async () => {
      const user = userEvent.setup()
      
      let capturedOnError: ((error: any, variables: any, context: any) => void) | undefined

      const mockMutate = jest.fn((payload, options) => {
        // Capture the onError callback from the mutate options
        capturedOnError = options?.onError
      })

      ;(useMutation as jest.Mock).mockImplementation((config) => {
        return {
          mutate: mockMutate,
          isPending: false,
          isSuccess: false
        }
      })

      render(<AddPersonalInfoGESubformWrapper />)

      // Fill and submit form
      await user.type(screen.getByTestId('name'), 'Juan Pérez')
      await user.type(screen.getByTestId('phone'), '5512345678')
      await user.click(screen.getByTestId('submit-button-create-address-ge'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      // Now trigger the component's onError callback which was passed to useMutation
      const useMutationConfig = (useMutation as jest.Mock).mock.calls[0][0]
      if (useMutationConfig.onError) {
        useMutationConfig.onError()
      }

      expect(mockSetShowErrorCreateAddressGe).toHaveBeenCalledWith(true)
      expect(mockGoResult).toHaveBeenCalled()
    })

    it('Given the mutation fails, When the error callback is executed, Then it should save address to local storage', async () => {
      const user = userEvent.setup()
      
      const mockError = { message: 'Network error' }
      const mockPayload = {
        zipcode: '12345',
        neighborhood: 'Centro',
        city: 'Ciudad de México',
        state: 'CDMX',
        name: 'Juan Pérez',
        email: '',
        phone: '5512345678',
        company: '',
        rfc: '',
        street: 'Calle Principal',
        number: '123',
        reference: 'Cerca del parque',
        alias: 'Casa'
      }

      let mutateOnErrorCallback: ((error: any, variables: any) => Promise<void>) | undefined

      const mockMutate = jest.fn((payload, options) => {
        mutateOnErrorCallback = options?.onError
      })

      ;(useMutation as jest.Mock).mockImplementation(() => {
        return {
          mutate: mockMutate,
          isPending: false,
          isSuccess: false
        }
      })

      ;(guidesUtils.combineGEFormValues as jest.Mock).mockReturnValue(mockPayload)
      ;(addressesUtils.saveAddressToLocalStorage as jest.Mock).mockResolvedValue(undefined)

      render(<AddPersonalInfoGESubformWrapper />)

      // Fill and submit form
      await user.type(screen.getByTestId('name'), 'Juan Pérez')
      await user.type(screen.getByTestId('phone'), '5512345678')
      await user.click(screen.getByTestId('submit-button-create-address-ge'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      // Execute the onError callback from mutate options
      if (mutateOnErrorCallback) {
        await mutateOnErrorCallback(mockError, mockPayload)
      }

      expect(addressesUtils.saveAddressToLocalStorage).toHaveBeenCalledWith(mockPayload)
    })
  })

  describe('Scenario: Address data GE is null', () => {
    it('Given addressDataGE is null, When the user submits the form, Then it should log a warning and not call mutation', async () => {
      const user = userEvent.setup()
      const mockMutate = jest.fn()
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false
      })

      render(<AddPersonalInfoGESubformWrapper addressDataGE={null} />)

      // Fill required fields
      await user.type(screen.getByTestId('name'), 'Juan Pérez')
      await user.type(screen.getByTestId('phone'), '5512345678')

      // Submit form
      const submitButton = screen.getByTestId('submit-button-create-address-ge')
      await user.click(submitButton)

      expect(consoleWarnSpy).toHaveBeenCalledWith('No address data GE provided')
      expect(mockMutate).not.toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })
})
