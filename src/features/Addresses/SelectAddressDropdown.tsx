import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface SelectAddressDropdownProps {
  aliasSelected: string;
  errorMessage: string;
  hideTownDropdown?: boolean;
  hideCityDropdown?: boolean;
  setErrorMessage: (message: string) => void;
  setAliasSelected: (alias: string) => void
  updateAddressInfo: ({ newAddress, town, city }: UpdateAddressInfoPayload) => void
}

export const SelectAddressDropdown = ({
  aliasSelected, errorMessage, setAliasSelected, updateAddressInfo, setErrorMessage, hideTownDropdown = false, hideCityDropdown = false
}: SelectAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()

  const [showTownSelector, setShowTownSelector] = useState(false);
  const [townSelected, setTownSelected] = useState<string>("");
  const [towns, setTowns] = useState<string[]>([]);

  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySelected, setCitySelected] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);

  const handleSelectAddress = (address: Address) => {
    console.log("Selected address:", address);

    if (address.town.length > 1) {
      setShowTownSelector(true);
      setTowns(address.town);
      setTownSelected("");
    } else {
      setShowTownSelector(false);
      setTowns([]);
      setTownSelected(address.town?.[0] || "");
    }

    if (address.city.length > 1) {
      setShowCitySelector(true);
      setCities(address.city);
      setCitySelected("");
    } else {
      setShowCitySelector(false);
      setCities([]);
      setCitySelected(address.city?.[0] || "");
    }

    if (errorMessage) {
      setErrorMessage("")
    }

    setAliasSelected(address.alias)
    updateAddressInfo({ newAddress: address, town: townSelected, city: citySelected })
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
          <DropdownItem key={`alias-${address.alias}`} onClick={() => handleSelectAddress(address)}>
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
              { errorMessage && (
                <ErrorMessage>{errorMessage}</ErrorMessage>
              )}
            </div>
          )}
        >
          { (towns.length > 0 )&& towns.map((town) => (
            <DropdownItem key={`town-${town}`} onClick={() => setTownSelected(town)}>
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
            <DropdownItem key={`city-${city}`} onClick={() => setCitySelected(city)}>
              {city}
            </DropdownItem>
          )) }
        </Dropdown>
      )}
    </div>
  )
}