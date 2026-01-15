"use client"
import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { getGEAliasesCb } from "@/shared/utils/guides.utils";
import { AddressExtraInfoGE } from "@/shared/types/guides.types";
import { Address } from "@/shared/types/addresses.types";

interface SelectOnlyAddressDropdownProps {
  aliasSelected: string | null;
  aliasError: string | null
  updateAliasSelection: ({ newAlias, addressInfo }:{ newAlias: string, addressInfo: AddressExtraInfoGE }) => void;
  setAliasError: (newError: string) => void;
}

export const SelectOnlyAddressDropdown = ({ aliasSelected, aliasError, updateAliasSelection, setAliasError }: SelectOnlyAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()
  const { data: aliasesGE,  isPending: isPendingFetchAliasGE, isError: isErrorFetchAliasGE } = useQuery({
    queryKey: ['aliasAddresses'],
    queryFn: () => getGEAliasesCb(true)
  })

  const onSelectAlias = (newAddress: Address) => {
    if (aliasError) setAliasError('')

    // Check if alias exists in GE aliases
    const aliasGEFound = aliasesGE?.find(aliasGe => aliasGe === newAddress.alias)
    if (!aliasGEFound) {
      // This alias does not exist in GE. Go to addresses to create it as well
      setAliasError("El alias seleccionado no existe para envíos GE. Por favor, crea la dirección con este alias en la sección de direcciones.");
    }

    const addressInfo: AddressExtraInfoGE = {
      addressName: newAddress.addressName,
      externalNumber: newAddress.externalNumber,
      internalNumber: newAddress.internalNumber,
      neighborhood: newAddress.neighborhood,
      city: newAddress.city?.[0],
      state: newAddress.state,
      zipcode: newAddress.zipcode,
    }
    updateAliasSelection({ newAlias: newAddress.alias, addressInfo })
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
            { (isError && !isPending && !isPendingFetchAliasGE) && ("No se han podido cargar los alias")}
            { (!isError && isErrorFetchAliasGE && !isPending && !isPendingFetchAliasGE) && ("No se han podido cargar los alias de GE")}
            { (!isPending && !isPendingFetchAliasGE && !isError && !isErrorFetchAliasGE && addresses && addresses.length > 0 && !aliasSelected) && 'Alias de dirección'}
            { (!isPending && !isPendingFetchAliasGE && !isError && !isErrorFetchAliasGE && addresses && addresses.length > 0 && aliasSelected) && aliasSelected }
            <RiArrowDownSLine />
          </Button>
          { aliasError && (
            <ErrorMessage>{aliasError}</ErrorMessage>
          )}
        </div>
      )}
    >
      { (addresses && addresses.length > 0 )&& addresses.map((address) => (
        <DropdownItem key={`alias-${address.alias}`} onClick={() => onSelectAlias(address)}>
          {address.alias}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}