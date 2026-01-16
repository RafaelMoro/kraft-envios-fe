import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DeleteAddressModal } from "@/features/Addresses/DeleteAddressModal"
import { Address } from "@/shared/types/addresses.types"

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
  addressToDelete,
  toggleModal,
  refetchAddresses,
}: {
  open: boolean
  addressToDelete: Address | null
  toggleModal: () => void
  refetchAddresses: () => Promise<void>
}) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <DeleteAddressModal
        open={open}
        addressToDelete={addressToDelete}
        toggleModal={toggleModal}
        refetchAddresses={refetchAddresses}
      />
    </QueryClientProvider>
  )
}

describe('Feature: Delete Address Modal', () => {
  const mockAddress: Address = {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '',
    reference: '',
    zipcode: '12345',
    state: 'Estado',
    city: ['Ciudad'],
    town: ['Municipio'],
    alias: 'Casa',
    neighborhood: 'Colonia',
    isGEAddress: false,
  }

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

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      expect(screen.getByRole('heading', { name: /eliminar dirección/i })).toBeInTheDocument()
      expect(screen.getByText(/¿estás seguro que deseas eliminar la dirección "casa"\?/i)).toBeInTheDocument()
      expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Modal is hidden when open prop is false', () => {
    it('Given the modal is closed, When the component renders, Then it should not display the modal', () => {
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()

      render(
        <DeleteAddressModalWrapper
          open={false}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
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

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(toggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Successful address deletion', () => {
    it('Given valid address alias, When the user confirms deletion, Then the address should be deleted successfully', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)

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
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const deleteButton = screen.getByTestId('delete-button')
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
    })
  })

  describe('Scenario: Show loading spinner during deletion', () => {
    it('Given deletion is in progress, When the user clicks delete, Then it should display a loading spinner', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)

      mockedAxios.delete.mockImplementation(() => new Promise(() => {}))

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/loading delete address/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Failed address deletion shows error in modal', () => {
    it('Given valid address alias, When the API returns an error, Then the error should be displayed in the modal', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()

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
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/ocurrió un error al eliminar la dirección/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { name: /error al eliminar la dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Disable buttons during deletion', () => {
    it('Given deletion is in progress, When the component is in pending state, Then cancel and delete buttons should be disabled', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)

      mockedAxios.delete.mockImplementation(() => new Promise(() => {}))

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const deleteButton = screen.getByTestId('delete-button')
      const cancelButton = screen.getByTestId('cancel-button')

      await user.click(deleteButton)

      await waitFor(() => {
        expect(deleteButton).toBeDisabled()
        expect(cancelButton).toBeDisabled()
      })
    })
  })

  describe('Scenario: GE Address deletion flow', () => {
    it('Given a GE address, When the modal opens, Then it should show GE deletion warning', () => {
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const geAddress = { ...mockAddress, isGEAddress: true }

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={geAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      expect(screen.getByText(/esta dirección también será eliminada de ge/i)).toBeInTheDocument()
    })

    it('Given a GE address, When deletion succeeds, Then it should show both deletion confirmations', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)
      const geAddress = { ...mockAddress, isGEAddress: true }

      // Mock GE addresses fetch
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            addresses: [
              { id: 'ge-123', alias: 'Casa' }
            ]
          }
        }
      })

      // Mock GE address deletion
      mockedAxios.delete.mockResolvedValueOnce({
        data: { success: true }
      })

      // Mock regular address deletion
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              alias: 'Casa'
            }
          }
        }
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={geAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('delete-button')).not.toBeDisabled()
      })

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/dirección eliminada en el sistema/i)).toBeInTheDocument()
        expect(screen.getByText(/dirección eliminada en ge/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { name: /dirección eliminada/i })).toBeInTheDocument()
    })

    it('Given GE address fetch fails, When the modal opens, Then it should show error in title', async () => {
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn()
      const geAddress = { ...mockAddress, isGEAddress: true }

      mockedAxios.get.mockRejectedValueOnce({
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed'
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={geAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /error al obtener la dirección de ge/i })).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Show "Listo" button after completion', () => {
    it('Given deletion succeeded, When result is shown, Then it should display "Listo" button', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const refetchAddresses = jest.fn().mockResolvedValue(undefined)

      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          data: {
            address: {
              alias: 'Casa'
            }
          },
          success: true,
        }
      })

      render(
        <DeleteAddressModalWrapper
          open={true}
          addressToDelete={mockAddress}
          toggleModal={toggleModal}
          refetchAddresses={refetchAddresses}
        />
      )

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      await waitFor(() => {
        expect(refetchAddresses).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
      })

      const listoButton = screen.getByTestId('confirm-button')
      await user.click(listoButton)

      expect(toggleModal).toHaveBeenCalled()
    })
  })
})
