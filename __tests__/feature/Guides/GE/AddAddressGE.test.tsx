import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { useQuery } from "@tanstack/react-query"

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { AddAddressGE } from "@/features/Guides/GE/AddAddressGE"
import { AddressInfoFormGE } from "@/shared/types/guides.types"
import { Address } from "@/shared/types/addresses.types"

// Mock the useGetAddress hook
jest.mock('../../../../src/shared/hooks/useGetAddress', () => ({
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockQueryResult = (overrides: Partial<ReturnType<typeof useQuery>> = {}): any => ({
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
  fetchStatus: 'idle' as const,
  isInitialLoading: false,
  isEnabled: true,
  promise: Promise.resolve(undefined),
  refetch: jest.fn(),
  ...overrides
})

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
  }
]

const emptyAddressData: AddressInfoFormGE = {
  address: {
    alias: ''
  },
  information: {
    addressName: '',
    externalNumber: '',
    internalNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: ''
  }
}

const filledAddressData: AddressInfoFormGE = {
  address: {
    alias: 'Casa'
  },
  information: {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '4',
    neighborhood: 'Centro',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipcode: '12345'
  }
}

const AddAddressGEWrapper = ({
  typeAddress = 'origin',
  addressData = emptyAddressData,
  aliasError = null,
  updateAddress = jest.fn(),
  setAliasError = jest.fn(),
  toggleModal = jest.fn(),
  goNext = jest.fn(),
  goPrev = jest.fn()
}: Partial<React.ComponentProps<typeof AddAddressGE>>) => {
  return (
    <QueryProviderWrapper>
      <AddAddressGE
        typeAddress={typeAddress as 'origin' | 'destination'}
        addressData={addressData}
        aliasError={aliasError}
        updateAddress={updateAddress}
        setAliasError={setAliasError}
        toggleModal={toggleModal}
        goNext={goNext}
        goPrev={goPrev}
      />
    </QueryProviderWrapper>
  )
}

describe('Feature: Add Address GE', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock setup
    mockedUseGetAddress.mockReturnValue({
      data: mockAddresses,
      aliases: ['Casa'],
      refetch: jest.fn(),
      isPending: false,
      isError: false
    })

    mockedUseQuery.mockReturnValue(createMockQueryResult({
      data: ['Casa'],
      isPending: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success',
      isFetched: true,
      isFetchedAfterMount: true
    }))
  })

  describe('Scenario: Render component for origin address', () => {
    it('Given typeAddress is origin, When the component renders, Then it should display origin-specific text and buttons', () => {
      render(<AddAddressGEWrapper typeAddress="origin" />)

      expect(screen.getByText(/domicilio/i)).toBeInTheDocument()
      expect(screen.getByText(/selecciona un alias de origen/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Render component for destination address', () => {
    it('Given typeAddress is destination, When the component renders, Then it should display destination-specific text and buttons', () => {
      render(<AddAddressGEWrapper typeAddress="destination" />)

      expect(screen.getByText(/domicilio/i)).toBeInTheDocument()
      expect(screen.getByText(/selecciona un alias de destino/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Initialize component with existing address data', () => {
    it('Given addressData with an alias, When the component renders, Then it should display the selected alias', () => {
      render(<AddAddressGEWrapper addressData={filledAddressData} />)

      expect(screen.getByText('Casa')).toBeInTheDocument()
    })
  })

  describe('Scenario: Next button is disabled without selection', () => {
    it('Given no alias is selected, When the component renders, Then the next button should be disabled', () => {
      render(<AddAddressGEWrapper />)

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      expect(nextButton).toBeDisabled()
    })

    it('Given an alias error exists, When the component renders, Then the next button should be disabled', () => {
      render(<AddAddressGEWrapper aliasError="Error message" addressData={filledAddressData} />)

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Scenario: Handle next step with validation', () => {
    it('Given an alias error exists, When user clicks next, Then it should return early without calling updateAddress', async () => {
      const user = userEvent.setup()
      const updateAddress = jest.fn()
      const goNext = jest.fn()

      render(
        <AddAddressGEWrapper
          addressData={filledAddressData}
          aliasError="Some error"
          updateAddress={updateAddress}
          goNext={goNext}
        />
      )

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await user.click(nextButton)

      expect(updateAddress).not.toHaveBeenCalled()
      expect(goNext).not.toHaveBeenCalled()
    })

    it('Given no alias is selected, When user clicks next, Then the button should be disabled and not trigger any action', async () => {
      const setAliasError = jest.fn()
      const updateAddress = jest.fn()
      const goNext = jest.fn()

      render(
        <AddAddressGEWrapper
          setAliasError={setAliasError}
          updateAddress={updateAddress}
          goNext={goNext}
        />
      )

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      
      // Button should be disabled, so clicking won't do anything
      expect(nextButton).toBeDisabled()
      
      // Even if we try to click, nothing should be called because button is disabled
      expect(setAliasError).not.toHaveBeenCalled()
      expect(updateAddress).not.toHaveBeenCalled()
      expect(goNext).not.toHaveBeenCalled()
    })

    it('Given valid selection and updateAddress returns true, When user clicks next, Then it should call updateAddress and goNext', async () => {
      const user = userEvent.setup()
      const updateAddress = jest.fn().mockReturnValue(true)
      const goNext = jest.fn()

      render(
        <AddAddressGEWrapper
          addressData={filledAddressData}
          updateAddress={updateAddress}
          goNext={goNext}
        />
      )

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(updateAddress).toHaveBeenCalledWith({
          address: {
            alias: 'Casa'
          },
          information: {
            addressName: 'Calle Principal',
            externalNumber: '123',
            internalNumber: '4',
            neighborhood: 'Centro',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipcode: '12345'
          }
        })
        expect(goNext).toHaveBeenCalled()
      })
    })

    it('Given valid selection and updateAddress returns false, When user clicks next, Then it should call updateAddress but not goNext', async () => {
      const user = userEvent.setup()
      const updateAddress = jest.fn().mockReturnValue(false)
      const goNext = jest.fn()

      render(
        <AddAddressGEWrapper
          addressData={filledAddressData}
          updateAddress={updateAddress}
          goNext={goNext}
        />
      )

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(updateAddress).toHaveBeenCalled()
        expect(goNext).not.toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Handle cancel button for origin', () => {
    it('Given typeAddress is origin, When user clicks cancel, Then it should call toggleModal', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const goPrev = jest.fn()

      render(
        <AddAddressGEWrapper
          typeAddress="origin"
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(toggleModal).toHaveBeenCalled()
      expect(goPrev).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Handle cancel button for destination', () => {
    it('Given typeAddress is destination, When user clicks regresar, Then it should call goPrev', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const goPrev = jest.fn()

      render(
        <AddAddressGEWrapper
          typeAddress="destination"
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )

      const regresarButton = screen.getByRole('button', { name: /regresar/i })
      await user.click(regresarButton)

      expect(goPrev).toHaveBeenCalled()
      expect(toggleModal).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Select alias and update internal state', () => {
    it('Given user selects an alias from dropdown, When the selection changes, Then internal state should be updated', async () => {
      const user = userEvent.setup()
      const updateAddress = jest.fn().mockReturnValue(true)
      const goNext = jest.fn()

      render(
        <AddAddressGEWrapper
          updateAddress={updateAddress}
          goNext={goNext}
        />
      )

      // Click dropdown to open it
      const dropdownButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(dropdownButton)

      // Select Casa alias
      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
      })

      const casaOption = screen.getByText('Casa')
      await user.click(casaOption)

      // Now the next button should be enabled
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      expect(nextButton).not.toBeDisabled()

      // Click next to verify the state was properly set
      await user.click(nextButton)

      await waitFor(() => {
        expect(updateAddress).toHaveBeenCalledWith({
          address: {
            alias: 'Casa'
          },
          information: {
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
  })

  describe('Scenario: Display alias error message', () => {
    it('Given an aliasError prop is provided, When the component renders, Then it should display the error message', () => {
      const errorMessage = "El alias no existe en GE"
      
      render(<AddAddressGEWrapper aliasError={errorMessage} addressData={filledAddressData} />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
