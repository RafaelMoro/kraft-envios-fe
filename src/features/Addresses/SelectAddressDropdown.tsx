import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface SelectAddressDropdownProps {
  aliasSelected: string;
  errorMessage: string;
  townError: string;
  hideTownDropdown?: boolean;
  hideCityDropdown?: boolean;
  setErrorMessage: (message: string) => void;
  setTownError: (message: string) => void;
  setAliasSelected: (alias: string) => void
  updateAddressInfo: ({ newAddress, town, city }: UpdateAddressInfoPayload) => void
}

export const SelectAddressDropdown = ({
  aliasSelected, errorMessage, townError, hideTownDropdown = false, hideCityDropdown = false,
  setAliasSelected, updateAddressInfo, setErrorMessage, setTownError,
}: SelectAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [showTownSelector, setShowTownSelector] = useState(false);
  const [townSelected, setTownSelected] = useState<string>("");
  const [towns, setTowns] = useState<string[]>([]);

  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySelected, setCitySelected] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);

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
              { (!isPending && addresses && addresses.length > 0 && !aliasSelected) && 'Alias de dirección'}
              { (!isPending && addresses && addresses.length > 0 && aliasSelected) && aliasSelected}
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
                data-testid="select-town-dropdown-button"
                color="light"
                disabled={!showCitySelector}
              >
                { !citySelected && 'Selecciona la ciudad'}
                { citySelected && citySelected}
                <RiArrowDownSLine />
              </Button>
              { errorMessage && (
                <ErrorMessage>{errorMessage}</ErrorMessage>
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