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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Modal displays correct heading', () => {
    it('Given the modal is open in create mode, When the component renders, Then it should display "Crear dirección"', () => {
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
    })

    it('Given the modal is open in edit mode, When the component renders, Then it should display "Editar dirección"', () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <ManageAddressWrapper
          open={true}
          isEdit={true}
          formData={existingAddressData}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.getByRole('heading', { name: /editar dirección/i })).toBeInTheDocument()
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
      expect(screen.getByRole('button', { name: /editar dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Modal visibility', () => {
    it('Given the modal is closed, When the component renders, Then it should not display the modal content', () => {
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

  describe('Scenario: Initial subscreen is CREATE_ADDRESS', () => {
    it('Given the modal opens, When it renders, Then it should show the CreateAddressSubform', () => {
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

      // CreateAddressSubform should be visible (has toggle switch for creating in GE)
      expect(screen.getByText(/crear dirección en ge/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Successful create address without GE closes modal after delay', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('Given a successful address creation without GE, When onSuccess is called, Then modal should close after delay', async () => {
      jest.useFakeTimers()
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: { address: {} },
          success: true
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

      const user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime })

      // Fill minimal required fields
      await user.type(screen.getByTestId('street1'), 'Calle Test')
      await user.type(screen.getByTestId('externalNumber'), '123')
      await user.type(screen.getByTestId('neighborhood'), 'Centro')
      await user.type(screen.getByTestId('zipcode'), '12345')
      await user.type(screen.getByTestId('state'), 'CDMX')
      await user.type(screen.getByTestId('alias'), 'Test')

      // Add cities and towns
      const citiesInput = screen.getByTestId('cities')
      await user.type(citiesInput, 'CDMX{Enter}')
      const townsInput = screen.getByTestId('towns')
      await user.type(townsInput, 'Cuauhtémoc{Enter}')

      // Check the consent checkbox
      const consentCheckbox = screen.getByRole('checkbox')
      await user.click(consentCheckbox)

      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRefetchAddresses).toHaveBeenCalled()
      })

      // Advance timer to trigger modal close
      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(toggleModal).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })
  })

  describe('Scenario: Failed address creation shows error notification', () => {
    it('Given an address creation fails, When onError is called, Then error notification should be shown and modal closed', async () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'))

      render(
        <ManageAddressWrapper
          open={true}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const user = userEvent.setup({ delay: null })

      // Fill minimal required fields
      await user.type(screen.getByTestId('street1'), 'Calle Test')
      await user.type(screen.getByTestId('externalNumber'), '123')
      await user.type(screen.getByTestId('neighborhood'), 'Centro')
      await user.type(screen.getByTestId('zipcode'), '12345')
      await user.type(screen.getByTestId('state'), 'CDMX')
      await user.type(screen.getByTestId('alias'), 'Test')

      // Add cities and towns
      const citiesInput = screen.getByTestId('cities')
      await user.type(citiesInput, 'CDMX{Enter}')
      const townsInput = screen.getByTestId('towns')
      await user.type(townsInput, 'Cuauhtémoc{Enter}')

      // Check the consent checkbox
      const consentCheckbox = screen.getByRole('checkbox')
      await user.click(consentCheckbox)

      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateNotificationMessage).toHaveBeenCalledWith(expect.stringContaining('error al Crear la dirección'))
        expect(toggleNotification).toHaveBeenCalled()
        expect(toggleModal).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Edit mode error notification', () => {
    it('Given an address edit fails, When onError is called, Then error notification should show "Editar"', async () => {
      const toggleModal = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.put.mockRejectedValueOnce(new Error('API Error'))

      render(
        <ManageAddressWrapper
          open={true}
          isEdit={true}
          formData={existingAddressData}
          toggleModal={toggleModal}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const user = userEvent.setup({ delay: null })

      const submitButton = screen.getByTestId('origin-address-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateNotificationMessage).toHaveBeenCalledWith(expect.stringContaining('error al Editar la dirección'))
      })
    })
  })
})
