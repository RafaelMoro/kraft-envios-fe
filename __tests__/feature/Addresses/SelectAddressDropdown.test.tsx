import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address } from "@/shared/types/addresses.types"
import { AliasSavedTone } from "@/shared/types/guides.types"

// Mock the useGetAddress hook
jest.mock('../../../src/shared/hooks/useGetAddress', () => ({
  useGetAddress: jest.fn()
}))

import { useGetAddress } from "@/shared/hooks/useGetAddress"
const mockedUseGetAddress = useGetAddress as jest.MockedFunction<typeof useGetAddress>

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

const emptyAliasSaved: AliasSavedTone = {
  alias: '',
  town: '',
  address: {
    addressName: '',
    externalNumber: '',
    internalNumber: '',
    reference: '',
    zipcode: '',
    state: '',
    city: [],
    town: [],
    alias: '',
    neighborhood: ''
  },
  addressTone: {
    name: '',
    lastName: '',
    phone: '',
    email: '',
    street1: '',
    neighborhood: '',
    town: '',
    external_number: '',
    state: '',
    reference: ''
  }
}

const SelectAddressDropdownWrapper = ({
  aliasSaved = emptyAliasSaved,
  errorMessage = '',
  townError = '',
  cityError = '',
  hideTownDropdown = false,
  hideCityDropdown = false,
  setErrorMessage = jest.fn(),
  setTownError = jest.fn(),
  setCityError = jest.fn(),
  setAliasSelected = jest.fn(),
  updateAddressInfo = jest.fn()
}: Partial<React.ComponentProps<typeof SelectAddressDropdown>> & { aliasSaved?: AliasSavedTone }) => {
  return (
    <QueryProviderWrapper>
      <SelectAddressDropdown
        aliasSaved={aliasSaved}
        errorMessage={errorMessage}
        townError={townError}
        cityError={cityError}
        hideTownDropdown={hideTownDropdown}
        hideCityDropdown={hideCityDropdown}
        setErrorMessage={setErrorMessage}
        setTownError={setTownError}
        setCityError={setCityError}
        setAliasSelected={setAliasSelected}
        updateAddressInfo={updateAddressInfo}
      />
    </QueryProviderWrapper>
  )
}

describe('Feature: Select Address Dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display address dropdown when loading', () => {
    it('Given addresses are being loaded, When the component renders, Then it should show a spinner', () => {
      mockedUseGetAddress.mockReturnValue({
        data: undefined,
        aliases: [],
        refetch: jest.fn(),
        isPending: true,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display error message when addresses fail to load', () => {
    it('Given addresses failed to load, When the component renders, Then it should display an error message', () => {
      mockedUseGetAddress.mockReturnValue({
        data: undefined,
        aliases: [],
        refetch: jest.fn(),
        isPending: false,
        isError: true
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
      expect(screen.getByText(/no se han podido cargar los alias/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display alias dropdown with addresses', () => {
    it('Given addresses are loaded successfully, When the component renders, Then it should display the alias dropdown with placeholder text', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).not.toBeDisabled()
      expect(screen.getByText(/alias de dirección/i)).toBeInTheDocument()
    })

    it('Given addresses are loaded and an alias is saved, When the component renders, Then it should display the saved alias', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      const aliasSaved: AliasSavedTone = {
        ...emptyAliasSaved,
        alias: 'Casa',
        address: mockAddresses[0]
      }

      render(<SelectAddressDropdownWrapper aliasSaved={aliasSaved} />)

      expect(screen.getByText('Casa')).toBeInTheDocument()
    })
  })

  describe('Scenario: Select an alias from the dropdown', () => {
    it('Given addresses are loaded, When user clicks on the dropdown and selects an alias, Then it should call setAliasSelected and updateAddressInfo', async () => {
      const user = userEvent.setup()
      const setAliasSelected = jest.fn()
      const updateAddressInfo = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          setAliasSelected={setAliasSelected}
          updateAddressInfo={updateAddressInfo}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const casaOption = await screen.findByText('Casa')
      await user.click(casaOption)

      expect(setAliasSelected).toHaveBeenCalledWith('Casa')
      expect(updateAddressInfo).toHaveBeenCalledWith({
        newAddress: mockAddresses[0],
        town: 'Cuauhtémoc',
        city: 'Ciudad de México'
      })
    })

    it('Given an error message is displayed, When user selects an alias, Then it should clear the error message', async () => {
      const user = userEvent.setup()
      const setErrorMessage = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          errorMessage="Error al seleccionar alias"
          setErrorMessage={setErrorMessage}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const casaOption = await screen.findByText('Casa')
      await user.click(casaOption)

      expect(setErrorMessage).toHaveBeenCalledWith('')
    })
  })

  describe('Scenario: Display town dropdown when address has multiple towns', () => {
    it('Given an address with multiple towns is selected, When the component renders, Then it should show the town dropdown enabled', async () => {
      const user = userEvent.setup()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(() => {
        const townButton = screen.getByTestId('select-town-dropdown-button')
        expect(townButton).not.toBeDisabled()
      })
    })

    it('Given an address with a single town is selected, When the component renders, Then it should disable the town dropdown', async () => {
      const user = userEvent.setup()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const casaOption = await screen.findByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        const townButton = screen.getByTestId('select-town-dropdown-button')
        expect(townButton).toBeDisabled()
      })
    })
  })

  describe('Scenario: Select a town from the dropdown', () => {
    it('Given the town dropdown is enabled, When user selects a town, Then it should call updateAddressInfo with the selected town', async () => {
      const user = userEvent.setup()
      const updateAddressInfo = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          updateAddressInfo={updateAddressInfo}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(async () => {
        const townButton = screen.getByTestId('select-town-dropdown-button')
        expect(townButton).not.toBeDisabled()
        await user.click(townButton)
      })

      const centroTown = await screen.findByRole('menuitem', { name: 'Centro' })
      await user.click(centroTown)

      expect(updateAddressInfo).toHaveBeenLastCalledWith({
        newAddress: mockAddresses[1],
        town: 'Centro',
        city: ''
      })
    })

    it('Given there is a town error, When user selects a town, Then it should clear the error', async () => {
      const user = userEvent.setup()
      const setTownError = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          townError="Error en municipio"
          setTownError={setTownError}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(async () => {
        const townButton = screen.getByTestId('select-town-dropdown-button')
        expect(townButton).not.toBeDisabled()
        await user.click(townButton)
      })

      const centroTown = await screen.findByRole('menuitem', { name: 'Centro' })
      await user.click(centroTown)

      expect(setTownError).toHaveBeenCalledWith('')
    })
  })

  describe('Scenario: Display city dropdown when address has multiple cities', () => {
    it('Given an address with multiple cities is selected, When the component renders, Then it should show the city dropdown enabled', async () => {
      const user = userEvent.setup()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(() => {
        const cityButton = screen.getByTestId('select-city-dropdown-button')
        expect(cityButton).not.toBeDisabled()
      })
    })

    it('Given an address with a single city is selected, When the component renders, Then it should disable the city dropdown', async () => {
      const user = userEvent.setup()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const casaOption = await screen.findByText('Casa')
      await user.click(casaOption)

      await waitFor(() => {
        const cityButton = screen.getByTestId('select-city-dropdown-button')
        expect(cityButton).toBeDisabled()
      })
    })
  })

  describe('Scenario: Select a city from the dropdown', () => {
    it('Given the city dropdown is enabled, When user selects a city, Then it should call updateAddressInfo with the selected city', async () => {
      const user = userEvent.setup()
      const updateAddressInfo = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          updateAddressInfo={updateAddressInfo}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(async () => {
        const cityButton = screen.getByTestId('select-city-dropdown-button')
        expect(cityButton).not.toBeDisabled()
        await user.click(cityButton)
      })

      const monterreyCity = await screen.findByRole('menuitem', { name: 'Monterrey' })
      await user.click(monterreyCity)

      expect(updateAddressInfo).toHaveBeenLastCalledWith({
        newAddress: mockAddresses[1],
        town: '',
        city: 'Monterrey'
      })
    })

    it('Given there is a city error, When user selects a city, Then it should clear the error', async () => {
      const user = userEvent.setup()
      const setCityError = jest.fn()

      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(
        <SelectAddressDropdownWrapper
          cityError="Error en ciudad"
          setCityError={setCityError}
        />
      )

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      await user.click(aliasButton)

      const oficinaOption = await screen.findByText('Oficina')
      await user.click(oficinaOption)

      await waitFor(async () => {
        const cityButton = screen.getByTestId('select-city-dropdown-button')
        expect(cityButton).not.toBeDisabled()
        await user.click(cityButton)
      })

      const monterreyCity = await screen.findByRole('menuitem', { name: 'Monterrey' })
      await user.click(monterreyCity)

      expect(setCityError).toHaveBeenCalledWith('')
    })
  })

  describe('Scenario: Hide town dropdown when prop is set', () => {
    it('Given hideTownDropdown is true, When the component renders, Then it should not display the town dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper hideTownDropdown={true} />)

      expect(screen.queryByTestId('select-town-dropdown-button')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Hide city dropdown when prop is set', () => {
    it('Given hideCityDropdown is true, When the component renders, Then it should not display the city dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper hideCityDropdown={true} />)

      expect(screen.queryByTestId('select-city-dropdown-button')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display error messages', () => {
    it('Given an errorMessage is provided, When the component renders, Then it should display the error message under the alias dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper errorMessage="Debe seleccionar un alias" />)

      expect(screen.getByText('Debe seleccionar un alias')).toBeInTheDocument()
    })

    it('Given a townError is provided, When the component renders, Then it should display the error message under the town dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper townError="Debe seleccionar un municipio" />)

      expect(screen.getByText('Debe seleccionar un municipio')).toBeInTheDocument()
    })

    it('Given a cityError is provided, When the component renders, Then it should display the error message under the city dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper cityError="Debe seleccionar una ciudad" />)

      expect(screen.getByText('Debe seleccionar una ciudad')).toBeInTheDocument()
    })
  })

  describe('Scenario: Component initializes with saved alias data', () => {
    it('Given an alias with multiple towns is saved, When the component renders, Then it should display the town dropdown enabled with the saved town', () => {
      mockedUseGetAddress.mockReturnValue({
        data: mockAddresses,
        aliases: ['Casa', 'Oficina'],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      const aliasSaved: AliasSavedTone = {
        ...emptyAliasSaved,
        alias: 'Oficina',
        town: 'Centro',
        address: mockAddresses[1]
      }

      render(<SelectAddressDropdownWrapper aliasSaved={aliasSaved} />)

      const townButton = screen.getByTestId('select-town-dropdown-button')
      expect(townButton).not.toBeDisabled()
      expect(screen.getByText('Centro')).toBeInTheDocument()
    })
  })

  describe('Scenario: Handle empty addresses list', () => {
    it('Given no addresses are available, When the component renders, Then it should disable the alias dropdown', () => {
      mockedUseGetAddress.mockReturnValue({
        data: [],
        aliases: [],
        refetch: jest.fn(),
        isPending: false,
        isError: false
      })

      render(<SelectAddressDropdownWrapper />)

      const aliasButton = screen.getByTestId('select-address-dropdown-button')
      expect(aliasButton).toBeDisabled()
    })
  })
})
