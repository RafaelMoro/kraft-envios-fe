import { useEffect, useState } from "react"
import { Button, Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"
import { HiChevronDown } from "react-icons/hi"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { AliasSaved } from "@/shared/types/guides.types"
import { AddressPreview } from "./AddressPreview"

interface SelectAddressDropdownProps<T extends AliasSaved> {
  aliasSaved: T;
  errorMessage: string;
  townError: string;
  cityError: string;
  hideTownDropdown?: boolean;
  hideCityDropdown?: boolean;
  setErrorMessage: (message: string) => void;
  setTownError: (message: string) => void;
  setCityError: (message: string) => void;
  setAliasSelected: (alias: string) => void
  updateAddressInfo: ({ newAddress, town, city }: UpdateAddressInfoPayload) => void
}

/**
 * This component renders a dropdown to select an address alias, town, and city. It's used with Pkk, Mn and TONE
 * For GE, it has its own SelectAliasGE component.
 */
export const SelectAddressDropdown = <T extends AliasSaved>({
  aliasSaved, errorMessage, townError, cityError, hideTownDropdown = false, hideCityDropdown = false,
  setAliasSelected, updateAddressInfo, setErrorMessage, setTownError, setCityError,
}: SelectAddressDropdownProps<T>) => {
  const { data: addresses, isPending, isError } = useGetAddress()
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(aliasSaved?.address);
  console.log('selectedAddress', selectedAddress)

  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [aliasPlaceholder, setAliasPlaceholder] = useState<string>("Alias de dirección");
  const handleInputFocus = () => {
    setShowDropdown(true)
  }
  const handleInputBlur = () => {
    // Add a small delay to allow option selection to complete before closing dropdown
    setTimeout(() => {
      setShowDropdown(false)
    }, 150)
  }

  const [searchTextAlias, setSearchTextAlias] = useState<string>(aliasSaved?.alias || "");
  const handleChangeAliasTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setSearchTextAlias(inputValue)

    // Filter addresses based on search input
    if (addresses && addresses.length > 0) {
      if (inputValue.trim() === "") {
        setFilteredAddresses(addresses)
      } else {
        const filtered = addresses.filter((address) =>
          address.alias.toLowerCase().includes(inputValue.toLowerCase())
        )
        setFilteredAddresses(filtered)
      }
    }
  }

  // When addresses are fetched, set them to the state. If there is a search term, filter them by the term.
  useEffect(() => {
    if (addresses && addresses.length > 0 && !isPending) {
      setFilteredAddresses(addresses)
    }
  }, [addresses, isPending])

  // Set the placeholder based on the state of fetching addresses and the saved alias
  useEffect(() => {
    if (isPending) {
      setAliasPlaceholder("Cargando alias...")
    }
    if (isError && !isPending) {
      setAliasPlaceholder("No se han podido cargar los alias")
    }
    if (!isPending && addresses && addresses.length > 0 && !aliasSaved.alias) {
      setAliasPlaceholder("Alias de dirección")
    }
    if (Array.isArray(addresses) && addresses.length === 0 && !isPending) {
      setAliasPlaceholder("No tienes alias guardados")
    }
  }, [isPending, isError, addresses, aliasSaved.alias])

  // If there is an alias already saved, set it as selected.
  useEffect(() => {
    if (!isPending && addresses && addresses.length > 0 && aliasSaved.alias) {
      setSearchTextAlias(aliasSaved.alias)
    }
  }, [addresses, aliasSaved.alias, isPending])

  const [showTownSelector, setShowTownSelector] = useState(aliasSaved?.address?.town.length > 1 || false);
  const [townSelected, setTownSelected] = useState<string>(aliasSaved.town);
  const [towns, setTowns] = useState<string[]>(aliasSaved?.address?.town || []);

  const [showCitySelector, setShowCitySelector] = useState(aliasSaved?.address?.city.length > 1 || false);
  const [citySelected, setCitySelected] = useState<string>(aliasSaved.city);
  const [cities, setCities] = useState<string[]>(aliasSaved?.address?.city || []);

  const handleSelectAlias = (address: Address) => {
    let newTown = ""
    let newCity = ""

    if (address.town.length > 1) {
      setShowTownSelector(true);
      setTowns(address.town);
      setTownSelected(newTown);
    } else {
      setShowTownSelector(false);
      setTowns([]);
      newTown = address.town?.[0] || "";
      setTownSelected(newTown);
    }

    if (address.city.length > 1) {
      setShowCitySelector(true);
      setCities(address.city);
      setCitySelected(newCity);
    } else {
      setShowCitySelector(false);
      setCities([]);
      newCity = address.city?.[0] || "";
      setCitySelected(newCity);
    }

    if (errorMessage) {
      setErrorMessage("")
    }

    setAliasSelected(address.alias)
    setSelectedAddress(address);
    updateAddressInfo({ newAddress: address, town: newTown, city: newCity })
  }

  const handleSelectTown = (town: string) => {
    if (townError) setTownError("");

    setTownSelected(town);
    if (!selectedAddress) {
      console.warn("No address selected");
      return;
    }
    updateAddressInfo({ newAddress: selectedAddress, town, city: citySelected })
  }

  const handleSelectCity = (city: string) => {
    if (cityError) setCityError("");

    setCitySelected(city);
    if (!selectedAddress) {
      console.warn("No address selected");
      return;
    }
    updateAddressInfo({ newAddress: selectedAddress, town: townSelected, city })
  }


  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        { selectedAddress?.addressName && (
          <div className="mb-5">
            <AddressPreview address={selectedAddress} />
          </div>
        )}
        <div className="mb-2 flex flex-col gap-2">
          <Label htmlFor="select-address-dropdown-button">Alias:</Label>
          { errorMessage && (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          )}
        </div>
        <TextInput
          data-testid="select-address-dropdown-button"
          id="select-address-dropdown-button"
          type="text"
          value={searchTextAlias}
          onChange={handleChangeAliasTerm}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={aliasPlaceholder}
          rightIcon={HiChevronDown}
          disabled={isPending || isError || !addresses || addresses.length === 0}
          autoComplete="off"
        />
        { showDropdown && (
          <ul className="bg-gray-200 dark:bg-gray-800 w-full absolute z-50 border border-gray-300 dark:border-gray-500 p-2.5 rounded-lg max-h-52 overflow-y-auto">
            { (filteredAddresses.length > 0) && filteredAddresses.map((address) => (
              <li key={`alias-${address.alias}`} onClick={() => handleSelectAlias(address)} className="hover:bg-gray-300 dark:hover:bg-gray-900 p-2 rounded-lg">{address.alias}</li>
            ))}
          </ul>
        ) }
      </div>
      {/* <Dropdown
        label=""
        renderTrigger={() => (
          <div className="flex flex-col gap-1">
            <Label className="pl-1">Alias</Label>
            <Button
              className="hover:cursor-pointer flex justify-between"
              data-testid="select-address-dropdown-button"
              color="light"
              disabled={isPending || isError || !addresses || addresses.length === 0}
            >
              { isPending && (<Spinner />)}
              { (isError && !isPending) && ("No se han podido cargar los alias")}
              { (!isPending && addresses && addresses.length > 0 && !aliasSaved.alias) && 'Alias de dirección'}
              { (!isPending && addresses && addresses.length > 0 && aliasSaved.alias) && aliasSaved.alias}
              <RiArrowDownSLine />
            </Button>
            { errorMessage && (
              <ErrorMessage>{errorMessage}</ErrorMessage>
            )}
          </div>
        )}
      >
        <div className="overflow-y-auto max-h-52">
          { (addresses && addresses.length > 0 )&& addresses.map((address) => (
            <DropdownItem key={`alias-${address.alias}`} onClick={() => handleSelectAlias(address)}>
              {address.alias}
            </DropdownItem>
          )) }
        </div>
      </Dropdown> */}
      { !hideTownDropdown && (
        <Dropdown
          label=""
          renderTrigger={() => (
            <div className="flex flex-col gap-1">
              <Label className="pl-1">Municipio</Label>
              <Button
                className="hover:cursor-pointer flex justify-between"
                data-testid="select-town-dropdown-button"
                color="light"
                disabled={!showTownSelector}
              >
                { !townSelected && 'Selecciona el municipio'}
                { townSelected && townSelected}
                <RiArrowDownSLine />
              </Button>
              { townError && (
                <ErrorMessage>{townError}</ErrorMessage>
              )}
            </div>
          )}
        >
          { (towns.length > 0 )&& towns.map((town) => (
            <DropdownItem key={`town-${town}`} onClick={() => handleSelectTown(town)}>
              {town}
            </DropdownItem>
          )) }
        </Dropdown>
      )}
      { !hideCityDropdown && (
        <Dropdown
          label=""
          renderTrigger={() => (
            <div className="flex flex-col gap-1">
              <Label className="pl-1">Ciudad</Label>
              <Button
                className="hover:cursor-pointer flex justify-between"
                data-testid="select-city-dropdown-button"
                color="light"
                disabled={!showCitySelector}
              >
                { !citySelected && 'Selecciona la ciudad'}
                { citySelected && citySelected}
                <RiArrowDownSLine />
              </Button>
              { cityError && (
                <ErrorMessage>{cityError}</ErrorMessage>
              )}
            </div>
          )}
        >
          { (cities.length > 0 )&& cities.map((city) => (
            <DropdownItem key={`city-${city}`} onClick={() => handleSelectCity(city)}>
              {city}
            </DropdownItem>
          )) }
        </Dropdown>
      )}
    </div>
  )
}