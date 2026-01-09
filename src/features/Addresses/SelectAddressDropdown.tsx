import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { AliasSaved } from "@/shared/types/guides.types"

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
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(aliasSaved?.address);

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
      <Dropdown
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
        { (addresses && addresses.length > 0 )&& addresses.map((address) => (
          <DropdownItem key={`alias-${address.alias}`} onClick={() => handleSelectAlias(address)}>
            {address.alias}
          </DropdownItem>
        )) }
      </Dropdown>
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