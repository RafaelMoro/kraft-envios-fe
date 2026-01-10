"use client"
import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { getAliasAddressesCb } from "@/shared/utils/guides.utils";

interface SelectOnlyAddressDropdownProps {
  aliasSelected: string | null;
  aliasError: string | null
  updateAliasSelection: (newAlias: string) => void;
  setAliasError: (newError: string) => void;
}

export const SelectOnlyAddressDropdown = ({ aliasSelected, aliasError, updateAliasSelection, setAliasError }: SelectOnlyAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()
  const { data: aliasesGE,  isPending: isPendingFetchAliasGE, isError: isErrorFetchAliasGE } = useQuery({
    queryKey: ['aliasAddresses'],
    queryFn: getAliasAddressesCb
  })

  const onSelectAlias = (newAlias: string) => {
    if (aliasError) setAliasError('')

    // Check if alias exists in GE aliases
    const aliasGEFound = aliasesGE?.find(aliasGe => aliasGe === newAlias)
    if (!aliasGEFound) {
      // This alias does not exist in GE. Go to addresses to create it as well
      setAliasError("El alias seleccionado no existe para envíos GE. Por favor, crea la dirección con este alias en la sección de direcciones.");
      return
    }

    updateAliasSelection(newAlias)
  }

  return (
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
            { (isPending || isPendingFetchAliasGE) && (<Spinner />)}
            { (isError && !isPending) && ("No se han podido cargar los alias")}
            { (isErrorFetchAliasGE && !isPendingFetchAliasGE) && ("No se han podido cargar los alias de GE")}
            { (!isPending && addresses && addresses.length > 0 && !aliasSelected) && 'Alias de dirección'}
            { (!isPending && addresses && addresses.length > 0 && aliasSelected) && aliasSelected }
            <RiArrowDownSLine />
          </Button>
          { aliasError && (
            <ErrorMessage>{aliasError}</ErrorMessage>
          )}
        </div>
      )}
    >
      { (addresses && addresses.length > 0 )&& addresses.map((address) => (
        <DropdownItem key={`alias-${address.alias}`} onClick={() => onSelectAlias(address.alias)}>
          {address.alias}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}