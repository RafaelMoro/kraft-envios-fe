import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { CreateAddress } from "@/features/Addresses/CreateAddress"

const CreateAddressWrapper = ({
  open,
  toggleModal,
  toggleNotification,
  updateNotificationMessage
}: {
  open: boolean
  toggleModal: () => void
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
}) => {
  return (
    <QueryProviderWrapper>
      <CreateAddress
        open={open}
        toggleModal={toggleModal}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
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
  city: 'Ciudad de México',
  town: 'Cuauhtémoc',
  state: 'CDMX',
  reference: 'Cerca del parque',
  alias: 'Casa'
}

describe('Feature: Create Address Modal', () => {
  describe('Scenario: Modal is displayed when open prop is true', () => {
    it('Given the modal is open, When the component renders, Then it should display all form fields', () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <CreateAddressWrapper
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
      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/municipio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estado de la república/i)).toBeInTheDocument()
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
        <CreateAddressWrapper
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
        <CreateAddressWrapper
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
        <CreateAddressWrapper
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
      expect(screen.getByText(/ciudad es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/municipio es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/estado es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/alias es requerido/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Form validation shows error for invalid zipcode', () => {
    it('Given the user enters an invalid zipcode, When the form is submitted, Then a validation error should be shown', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <CreateAddressWrapper
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
      await user.type(screen.getByLabelText(/ciudad/i), validFormData.city)
      await user.type(screen.getByLabelText(/municipio/i), validFormData.town)
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
              city: [validFormData.city],
              town: [validFormData.town],
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
        <CreateAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const user = userEvent.setup()

      const street1Input = screen.getByTestId('street1')
      const externalNumberInput = screen.getByTestId('externalNumber')
      const internalNumberInput = screen.getByTestId('internalNumber')
      const neighborhoodInput = screen.getByTestId('neighborhood')
      const zipcodeInput = screen.getByTestId('zipcode')
      const cityInput = screen.getByTestId('city')
      const townInput = screen.getByTestId('town')
      const stateInput = screen.getByTestId('state')
      const referenceInput = screen.getByTestId('reference')
      const aliasInput = screen.getByTestId('alias')

      fireEvent.change(street1Input, { target: { value: validFormData.street1 } })
      fireEvent.change(externalNumberInput, { target: { value: validFormData.externalNumber } })
      fireEvent.change(internalNumberInput, { target: { value: validFormData.internalNumber } })
      fireEvent.change(neighborhoodInput, { target: { value: validFormData.neighborhood } })
      fireEvent.change(zipcodeInput, { target: { value: validFormData.zipcode } })
      fireEvent.change(cityInput, { target: { value: validFormData.city } })
      fireEvent.change(townInput, { target: { value: validFormData.town } })
      fireEvent.change(stateInput, { target: { value: validFormData.state } })
      fireEvent.change(referenceInput, { target: { value: validFormData.reference } })
      fireEvent.change(aliasInput, { target: { value: validFormData.alias } })

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled()
        expect(toggleModal).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('Scenario: Failed address creation shows error notification', () => {
    it('Given valid form data, When the API returns an error, Then the error notification should be displayed', async () => {
      const user = userEvent.setup()
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
        <CreateAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const street1Input = screen.getByTestId('street1')
      const externalNumberInput = screen.getByTestId('externalNumber')
      const neighborhoodInput = screen.getByTestId('neighborhood')
      const zipcodeInput = screen.getByTestId('zipcode')
      const cityInput = screen.getByTestId('city')
      const townInput = screen.getByTestId('town')
      const stateInput = screen.getByTestId('state')
      const aliasInput = screen.getByTestId('alias')

      fireEvent.change(street1Input, { target: { value: validFormData.street1 } })
      fireEvent.change(externalNumberInput, { target: { value: validFormData.externalNumber } })
      fireEvent.change(neighborhoodInput, { target: { value: validFormData.neighborhood } })
      fireEvent.change(zipcodeInput, { target: { value: validFormData.zipcode } })
      fireEvent.change(cityInput, { target: { value: validFormData.city } })
      fireEvent.change(townInput, { target: { value: validFormData.town } })
      fireEvent.change(stateInput, { target: { value: validFormData.state } })
      fireEvent.change(aliasInput, { target: { value: validFormData.alias } })

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
        <CreateAddressWrapper
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
      await user.type(screen.getByLabelText(/ciudad/i), validFormData.city)
      await user.type(screen.getByLabelText(/municipio/i), validFormData.town)
      await user.type(screen.getByLabelText(/estado de la república/i), validFormData.state)
      await user.type(screen.getByLabelText(/alias/i), validFormData.alias)

      const submitButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el número exterior solo puede contener dígitos/i)).toBeInTheDocument()
      })
    })
  })
})
