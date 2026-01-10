import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { useQuery } from "@tanstack/react-query"

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { SelectOnlyAddressDropdown } from "@/features/Addresses/SelectOnlyAddressDropdown"
import { Address } from "@/shared/types/addresses.types"

// Mock the useGetAddress hook
jest.mock('../../../src/shared/hooks/useGetAddress', () => ({
  useGetAddress: jest.fn()
}))

// Mock useQuery from tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn()
}))

import { useGetAddress } from "@/shared/hooks/useGetAddress"
const mockedUseGetAddress = useGetAddress as jest.MockedFunction<typeof useGetAddress>
const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

const mockAddresses: Address[] = [
  {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '4',
    reference: 'Cerca del parque',
    zipcode: '12345',
    state: 'CDMX',
    city: ['Ciudad de México'],
    town: ['Cuauhtémoc'],
    alias: 'Casa',
    neighborhood: 'Centro'
  },
  {
    addressName: 'Avenida Reforma',
    externalNumber: '456',
    internalNumber: '2',
    reference: 'Frente al metro',
    zipcode: '54321',
    state: 'Nuevo León',
    city: ['Monterrey', 'San Pedro'],
    town: ['Centro', 'Norte'],
    alias: 'Oficina',
    neighborhood: 'Residencial'
  }
]

const SelectOnlyAddressDropdownWrapper = ({
  aliasSelected = null,
  aliasError = null,
  updateAliasSelection = jest.fn(),
  setAliasError = jest.fn()
}: Partial<React.ComponentProps<typeof SelectOnlyAddressDropdown>>) => {
  return (
    <QueryProviderWrapper>
      <SelectOnlyAddressDropdown
        aliasSelected={aliasSelected}
        aliasError={aliasError}
        updateAliasSelection={updateAliasSelection}
        setAliasError={setAliasError}
      />
    </QueryProviderWrapper>
  )
}

describe('Feature: Select Only Address Dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display dropdown when both queries are loading', () => {
    it('Given addresses and GE aliases are being loaded, When the component renders, Then it should show a spinner', () => {
      mockedUseGetAddress.mockReturnValue({
        data: undefined,
        aliases: [],
        refetch: jest.fn(),
        isPending: true,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        error: null,
        isSuccess: false,
        status: 'pending',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: false,
        isFetchedAfterMount: false,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('Given addresses are loaded but GE aliases are still loading, When the component renders, Then it should show a spinner', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        error: null,
        isSuccess: false,
        status: 'pending',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: false,
        isFetchedAfterMount: false,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display error message when addresses fail to load', () => {
    it('Given addresses failed to load, When both queries finish, Then it should display addresses error message', () => {
      mockedUseGetAddress.mockReturnValue({
        data: undefined,
        aliases: [],
        refetch: jest.fn(),
        isPending: false,
        isError: true
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
      expect(screen.getByText(/no se han podido cargar los alias$/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display error message when GE aliases fail to load', () => {
    it('Given addresses loaded successfully but GE aliases failed to load, When both queries finish, Then it should display GE aliases error message', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        error: new Error('Failed to fetch'),
        isSuccess: false,
        status: 'error',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 1,
        failureReason: new Error('Failed to fetch'),
        errorUpdateCount: 1,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      expect(screen.getByText(/no se han podido cargar los alias de ge/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display alias dropdown with addresses', () => {
    it('Given addresses and GE aliases are loaded successfully, When the component renders, Then it should display the alias dropdown with placeholder text', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).not.toBeDisabled()
      expect(screen.getByText(/alias de dirección/i)).toBeInTheDocument()
    })

    it('Given addresses are loaded and an alias is selected, When the component renders, Then it should display the selected alias', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper aliasSelected="Casa" />)

      expect(screen.getByText('Casa')).toBeInTheDocument()
    })
  })

  describe('Scenario: Select an alias from the dropdown', () => {
    it('Given addresses are loaded and alias exists in GE, When user selects an alias, Then it should call updateAliasSelection with correct data', async () => {
      const user = userEvent.setup()
      const updateAliasSelection = jest.fn()
      const setAliasError = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(
        <SelectOnlyAddressDropdownWrapper
          updateAliasSelection={updateAliasSelection}
          setAliasError={setAliasError}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
      })

      const casaOption = screen.getByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        expect(updateAliasSelection).toHaveBeenCalledWith({
          newAlias: 'Casa',
          addressInfo: {
            addressName: 'Calle Principal',
            externalNumber: '123',
            internalNumber: '4',
            neighborhood: 'Centro',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipcode: '12345'
          }
        })
      })
    })

    it('Given alias does not exist in GE, When user selects the alias, Then it should set an error message', async () => {
      const user = userEvent.setup()
      const updateAliasSelection = jest.fn()
      const setAliasError = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Oficina'], // Only 'Oficina' exists in GE, not 'Casa'
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(
        <SelectOnlyAddressDropdownWrapper
          updateAliasSelection={updateAliasSelection}
          setAliasError={setAliasError}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
      })

      const casaOption = screen.getByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        expect(setAliasError).toHaveBeenCalledWith(
          "El alias seleccionado no existe para envíos GE. Por favor, crea la dirección con este alias en la sección de direcciones."
        )
      })
    })

    it('Given an alias error exists, When user selects a new alias, Then it should clear the error', async () => {
      const user = userEvent.setup()
      const updateAliasSelection = jest.fn()
      const setAliasError = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(
        <SelectOnlyAddressDropdownWrapper
          aliasError="Previous error message"
          updateAliasSelection={updateAliasSelection}
          setAliasError={setAliasError}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
      })

      const casaOption = screen.getByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        expect(setAliasError).toHaveBeenCalledWith('')
      })
    })
  })

  describe('Scenario: Display error message below dropdown', () => {
    it('Given an alias error exists, When the component renders, Then it should display the error message below the dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: ['Casa', 'Oficina'],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      const errorMessage = "El alias seleccionado no existe para envíos GE"

      render(<SelectOnlyAddressDropdownWrapper aliasError={errorMessage} />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  describe('Scenario: Dropdown is disabled when no addresses are available', () => {
    it('Given addresses list is empty, When the component renders, Then the dropdown should be disabled', () => {
      mockedUseGetAddress.mockReturnValue({
        data: [],
        aliases: [],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      mockedUseQuery.mockReturnValue({
        data: [],
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(),
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        fetchStatus: 'idle'
      })

      render(<SelectOnlyAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
    })
  })
})
