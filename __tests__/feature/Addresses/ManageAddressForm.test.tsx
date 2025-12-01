import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { ManageAddressForm } from "@/features/Addresses/ManageAddressForm"
import { CreateAddressPayload } from "@/shared/types/addresses.types";

const mockRefetchAddresses = jest.fn()

const emptyFormData: CreateAddressPayload = {
  addressName: '',
  externalNumber: '',
  internalNumber: '',
  neighborhood: '',
  zipcode: '',
  city: [],
  town: [],
  state: '',
  reference: '',
  alias: ''
}

const ManageAddressWrapper = ({
  open,
  formData = emptyFormData,
  isEdit = false,
  toggleModal,
  toggleNotification,
  updateNotificationMessage
}: {
  open: boolean
  formData?: CreateAddressPayload
  isEdit?: boolean
  toggleModal: () => void
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
}) => {
  return (
    <QueryProviderWrapper>
      <ManageAddressForm
        open={open}
        formData={formData}
        isEdit={isEdit}
        toggleModal={toggleModal}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
        refetchAddresses={mockRefetchAddresses}
      />
    </QueryProviderWrapper>
  )
}

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const validFormData = {
  street1: 'Calle Principal',
  externalNumber: '123',
  internalNumber: '4',
  neighborhood: 'Centro',
  zipcode: '12345',
  cities: ['Ciudad de México', 'Guadalajara'],
  towns: ['Cuauhtémoc', 'Miguel Hidalgo'],
  state: 'CDMX',
  reference: 'Cerca del parque',
  alias: 'Casa'
}

const existingAddressData: CreateAddressPayload = {
  addressName: 'Calle Vieja',
  externalNumber: '456',
  internalNumber: '2',
  neighborhood: 'Norte',
  zipcode: '54321',
  city: ['Monterrey'],
  town: ['San Pedro'],
  state: 'Nuevo León',
  reference: 'Frente al parque',
  alias: 'Oficina'
}

describe('Feature: Manage Address Modal', () => {
  describe('Scenario: Modal is displayed when open prop is true', () => {
    it('Given the modal is open, When the component renders, Then it should display all form fields', () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.getByRole('heading', { name: /crear dirección/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/calle/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numero exterior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numero interior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/colonia/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ciudades/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/municipios/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estado de la república/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/referencia/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/alias/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Modal is hidden when open prop is false', () => {
    it('Given the modal is closed, When the component renders, Then it should not display the modal', () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={false}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.queryByRole('heading', { name: /crear dirección/i })).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Cancel button closes the modal', () => {
    it('Given the modal is open, When the user clicks cancel, Then toggleModal should be called', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(toggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Form validation shows error messages for required fields', () => {
    it('Given the form is empty, When the user submits the form, Then validation errors should be displayed', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/la calle es requerida/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/el número exterior es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/colonia es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/el código postal es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/estado es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/alias es requerido/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Form validation shows error for empty cities and towns', () => {
    it('Given the form has all fields except cities and towns, When the form is submitted, Then validation errors should be shown', async () => {
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      await user.type(screen.getByTestId('street1'), validFormData.street1)
      await user.type(screen.getByTestId('externalNumber'), validFormData.externalNumber)
      await user.type(screen.getByTestId('neighborhood'), validFormData.neighborhood)
      await user.type(screen.getByTestId('zipcode'), validFormData.zipcode)
      await user.type(screen.getByTestId('state'), validFormData.state)
      await user.type(screen.getByTestId('alias'), validFormData.alias)

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/debe agregar al menos una ciudad/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/debe agregar al menos un municipio/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Form validation shows error for invalid zipcode', () => {
    it('Given the user enters an invalid zipcode, When the form is submitted, Then a validation error should be shown', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      await user.type(screen.getByLabelText(/calle/i), validFormData.street1)
      await user.type(screen.getByLabelText(/numero exterior/i), validFormData.externalNumber)
      await user.type(screen.getByLabelText(/colonia/i), validFormData.neighborhood)
      await user.type(screen.getByLabelText(/código postal/i), '123')
      await user.type(screen.getByLabelText(/estado de la república/i), validFormData.state)
      await user.type(screen.getByLabelText(/alias/i), validFormData.alias)

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el código postal debe tener 5 caracteres/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Successful address creation', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('Given valid form data, When the form is submitted, Then the address should be created successfully', async () => {
      jest.useFakeTimers()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              addressName: validFormData.street1,
              externalNumber: validFormData.externalNumber,
              internalNumber: validFormData.internalNumber,
              reference: validFormData.reference,
              postalCode: validFormData.zipcode,
              state: validFormData.state,
              city: validFormData.cities,
              town: validFormData.towns,
              alias: validFormData.alias,
              neighborhood: validFormData.neighborhood
            }
          },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const user = userEvent.setup({ delay: null })

      await user.type(screen.getByTestId('street1'), validFormData.street1)
      await user.type(screen.getByTestId('externalNumber'), validFormData.externalNumber)
      await user.type(screen.getByTestId('internalNumber'), validFormData.internalNumber)
      await user.type(screen.getByTestId('neighborhood'), validFormData.neighborhood)
      await user.type(screen.getByTestId('state'), validFormData.state)
      await user.type(screen.getByTestId('zipcode'), validFormData.zipcode)
      await user.type(screen.getByTestId('reference'), validFormData.reference)
      await user.type(screen.getByTestId('alias'), validFormData.alias)

      const citiesInput = screen.getByTestId('cities')
      const townsInput = screen.getByTestId('towns')

      for (const city of validFormData.cities) {
        await user.type(citiesInput, city)
        await user.keyboard('{Enter}')
      }

      for (const town of validFormData.towns) {
        await user.type(townsInput, town)
        await user.keyboard('{Enter}')
      }

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled()
      })

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(mockRefetchAddresses).toHaveBeenCalled()
        expect(toggleModal).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })
  })

  describe('Scenario: Failed address creation shows error notification', () => {
    it('Given valid form data, When the API returns an error, Then the error notification should be displayed', async () => {
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.post.mockRejectedValueOnce({
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 500',
        response: {
          data: {
            message: 'Internal server error'
          }
        }
      })

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      await user.type(screen.getByTestId('street1'), validFormData.street1)
      await user.type(screen.getByTestId('externalNumber'), validFormData.externalNumber)
      await user.type(screen.getByTestId('neighborhood'), validFormData.neighborhood)
      await user.type(screen.getByTestId('zipcode'), validFormData.zipcode)
      await user.type(screen.getByTestId('state'), validFormData.state)
      await user.type(screen.getByTestId('alias'), validFormData.alias)

      const citiesInput = screen.getByTestId('cities')
      const townsInput = screen.getByTestId('towns')

      await user.type(citiesInput, validFormData.cities[0])
      await user.keyboard('{Enter}')
      await user.type(townsInput, validFormData.towns[0])
      await user.keyboard('{Enter}')

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateNotificationMessage).toHaveBeenCalledWith('Ocurrió un error al crear la dirección. Por favor, intenta de nuevo.')
      }, { timeout: 3000 })
      expect(toggleNotification).toHaveBeenCalled()
      expect(toggleModal).toHaveBeenCalled()
    })
  })

  describe('Scenario: Form validation for external number format', () => {
    it('Given the user enters non-numeric external number, When the form is submitted, Then a validation error should be shown', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      await user.type(screen.getByLabelText(/calle/i), validFormData.street1)
      await user.type(screen.getByLabelText(/numero exterior/i), 'abc')
      await user.type(screen.getByLabelText(/colonia/i), validFormData.neighborhood)
      await user.type(screen.getByLabelText(/código postal/i), validFormData.zipcode)
      await user.type(screen.getByLabelText(/estado de la república/i), validFormData.state)
      await user.type(screen.getByLabelText(/alias/i), validFormData.alias)

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el número exterior solo puede contener dígitos/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Edit mode displays correct heading and pre-filled data', () => {
    it('Given the form is in edit mode, When the component renders, Then it should show "Editar dirección" and pre-filled values', () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          formData={existingAddressData}
          isEdit={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.getByRole('heading', { name: /editar dirección/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /editar dirección/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue(existingAddressData.addressName)).toBeInTheDocument()
      expect(screen.getByDisplayValue(existingAddressData.externalNumber)).toBeInTheDocument()
      expect(screen.getByDisplayValue(existingAddressData.alias)).toBeInTheDocument()
    })
  })

  describe('Scenario: Successful address edit', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('Given valid form data in edit mode, When the form is submitted, Then the address should be updated successfully', async () => {
      jest.useFakeTimers()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.put.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              alias: existingAddressData.alias
            }
          },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(
        <ManageAddressWrapper
          open={true}
          formData={existingAddressData}
          isEdit={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const user = userEvent.setup({ delay: null })

      // Clear and update the street field
      const streetInput = screen.getByTestId('street1')
      await user.clear(streetInput)
      await user.type(streetInput, 'Calle Nueva')

      const submitButton = screen.getByRole('button', { name: /editar dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalled()
      })

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(mockRefetchAddresses).toHaveBeenCalled()
        expect(toggleModal).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })
  })

  describe('Scenario: Failed address edit shows error notification', () => {
    it('Given valid form data in edit mode, When the API returns an error, Then the error notification should be displayed', async () => {
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.put.mockRejectedValueOnce({
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 500',
        response: {
          data: {
            message: 'Internal server error'
          }
        }
      })

      render(
        <ManageAddressWrapper
          open={true}
          formData={existingAddressData}
          isEdit={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const streetInput = screen.getByTestId('street1')
      await user.clear(streetInput)
      await user.type(streetInput, 'Calle Actualizada')

      const submitButton = screen.getByRole('button', { name: /editar dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateNotificationMessage).toHaveBeenCalledWith('Ocurrió un error al Editar la dirección. Por favor, intenta de nuevo.')
      }, { timeout: 3000 })
      expect(toggleNotification).toHaveBeenCalled()
      expect(toggleModal).toHaveBeenCalled()
    })
  })

  describe('Scenario: Alias cannot be edited in edit mode', () => {
    it('Given the form is in edit mode, When the user changes the alias and submits, Then an error message should be shown', async () => {
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          formData={existingAddressData}
          isEdit={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const aliasInput = screen.getByTestId('alias')
      await user.clear(aliasInput)
      await user.type(aliasInput, 'NuevoAlias')

      const submitButton = screen.getByRole('button', { name: /editar dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el alias no puede ser editado/i)).toBeInTheDocument()
      })

      // Ensure mutation was not called
      expect(mockedAxios.put).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Alias can be set in create mode', () => {
    it('Given the form is in create mode, When the user sets an alias and submits, Then no error should be shown', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              addressName: validFormData.street1,
              externalNumber: validFormData.externalNumber,
              internalNumber: validFormData.internalNumber,
              reference: validFormData.reference,
              postalCode: validFormData.zipcode,
              state: validFormData.state,
              city: validFormData.cities,
              town: validFormData.towns,
              alias: validFormData.alias,
              neighborhood: validFormData.neighborhood
            }
          },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      await user.type(screen.getByTestId('street1'), validFormData.street1)
      await user.type(screen.getByTestId('externalNumber'), validFormData.externalNumber)
      await user.type(screen.getByTestId('neighborhood'), validFormData.neighborhood)
      await user.type(screen.getByTestId('zipcode'), validFormData.zipcode)
      await user.type(screen.getByTestId('state'), validFormData.state)
      await user.type(screen.getByTestId('alias'), validFormData.alias)

      const citiesInput = screen.getByTestId('cities')
      const townsInput = screen.getByTestId('towns')

      await user.type(citiesInput, validFormData.cities[0])
      await user.keyboard('{Enter}')
      await user.type(townsInput, validFormData.towns[0])
      await user.keyboard('{Enter}')

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled()
      })

      // Should not show alias error
      expect(screen.queryByText(/el alias no puede ser editado/i)).not.toBeInTheDocument()

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(mockRefetchAddresses).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })
  })
})

