import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address } from "@/shared/types/addresses.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface SelectAddressDropdownProps {
  aliasSelected: string;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  setAliasSelected: (alias: string) => void
  updateAddressInfo: (newAddress: Address) => void
}

export const SelectAddressDropdown = ({ aliasSelected, errorMessage, setAliasSelected, updateAddressInfo, setErrorMessage }: SelectAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()
  const [showTownSelector, setShowTownSelector] = useState(false);
  const [townSelected, setTownSelected] = useState<string>("");
  const [towns, setTowns] = useState<string[]>([]);

  const handleSelectAddress = (address: Address) => {
    console.log("Selected address:", address);

    if (address.town.length > 1) {
      setShowTownSelector(true);
      setTowns(address.town);
    } else {
      setShowTownSelector(false);
      setTowns([]);
      setTownSelected(address.town?.[0] || "");
    }

    if (errorMessage) {
      setErrorMessage("")
    }

    setAliasSelected(address.alias)
    updateAddressInfo(address)
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
    </div>
  )
}