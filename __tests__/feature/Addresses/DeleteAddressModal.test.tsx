import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DeleteAddressModal } from "@/features/Addresses/DeleteAddressModal"

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
})

const DeleteAddressModalWrapper = ({
  open,
  addressAlias,
  toggleModal,
  refetchAddresses,
  toggleNotification,
  updateNotificationMessage
}: {
  open: boolean
  addressAlias: string
  toggleModal: () => void
  refetchAddresses: () => Promise<void>
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
}) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <DeleteAddressModal
        open={open}
        addressAlias={addressAlias}
        toggleModal={toggleModal}
        refetchAddresses={refetchAddresses}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
      />
    </QueryClientProvider>
  )
}

describe('Feature: Delete Address Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Scenario: Modal is displayed when open prop is true', () => {
    it('Given the modal is open, When the component renders, Then it should display the modal with address alias', () => {
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.getByRole('heading', { name: /eliminar dirección/i })).toBeInTheDocument()
      expect(screen.getByText(/¿estás seguro que deseas eliminar la dirección "casa"\?/i)).toBeInTheDocument()
      expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Modal is hidden when open prop is false', () => {
    it('Given the modal is closed, When the component renders, Then it should not display the modal', () => {
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <DeleteAddressModalWrapper
          open={false}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      expect(screen.queryByRole('heading', { name: /eliminar dirección/i })).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Cancel button closes the modal', () => {
    it('Given the modal is open, When the user clicks cancel, Then toggleModal should be called', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(toggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Successful address deletion', () => {
    it('Given valid address alias, When the user confirms deletion, Then the address should be deleted successfully', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              alias: 'Casa'
            }
          },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          expect.any(String),
          { data: { alias: 'Casa' } }
        )
      })

      await waitFor(() => {
        expect(refetchAddresses).toHaveBeenCalled()
      })

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(toggleModal).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Show loading spinner during deletion', () => {
    it('Given deletion is in progress, When the user clicks delete, Then it should display a loading spinner', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.delete.mockImplementation(() => new Promise(() => {}))

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Oficina"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/loading delete address/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Failed address deletion shows error notification', () => {
    it('Given valid address alias, When the API returns an error, Then the error notification should be displayed', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.delete.mockRejectedValueOnce({
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 500',
        response: {
          data: {
            message: 'Internal server error'
          }
        }
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(updateNotificationMessage).toHaveBeenCalledWith('Ocurrió un error al eliminar la dirección. Por favor, intenta de nuevo.')
      })
      expect(toggleNotification).toHaveBeenCalled()
      expect(toggleModal).toHaveBeenCalled()
    })
  })

  describe('Scenario: Disable buttons during deletion', () => {
    it('Given deletion is in progress, When the component is in pending state, Then cancel and delete buttons should be disabled', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.delete.mockImplementation(() => new Promise(() => {}))

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })

      expect(deleteButton).not.toBeDisabled()
      expect(cancelButton).not.toBeDisabled()

      await user.click(deleteButton)

      await waitFor(() => {
        expect(deleteButton).toBeDisabled()
        expect(cancelButton).toBeDisabled()
      })
    })
  })

  describe('Scenario: Show check icon after successful deletion', () => {
    it('Given deletion succeeded, When the component is in success state, Then it should display a check icon', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()

      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              alias: 'Casa'
            }
          },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressAlias="Casa"
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalled()
        expect(refetchAddresses).toHaveBeenCalled()
      })

      await waitFor(() => {
        const deleteButtonAfterSuccess = screen.queryByRole('button', { name: /eliminar/i })
        expect(deleteButtonAfterSuccess).not.toBeInTheDocument()
      })
    })
  })
})
