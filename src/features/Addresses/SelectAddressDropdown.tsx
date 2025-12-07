import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { Address } from "@/shared/types/addresses.types"

interface SelectAddressDropdownProps {
  aliasSelected: string
  setAliasSelected: (alias: string) => void
  updateAddressInfo: (newAddress: Address) => void
}

export const SelectAddressDropdown = ({ aliasSelected, setAliasSelected, updateAddressInfo }: SelectAddressDropdownProps) => {
  const { data: addresses, isPending, isError } = useGetAddress()

  const handleSelectAddress = (address: Address) => {
    setAliasSelected(address.alias)
    updateAddressInfo(address)
  }

  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <Button
          className="hover:cursor-pointer flex justify-between"
          color="light"
          disabled={isPending || isError || !addresses || addresses.length === 0}
        >
          { isPending && (<Spinner />)}
          { (isError && !isPending) && ("No se han podido cargar los alias")}
          { (!isPending && addresses && addresses.length > 0 && !aliasSelected) && 'Alias de dirección'}
          { (!isPending && addresses && addresses.length > 0 && aliasSelected) && aliasSelected}
          <RiArrowDownSLine />
        </Button>
      )}
    >
      { (addresses && addresses.length > 0 )&& addresses.map((address) => (
        <DropdownItem key={`alias-${address.alias}`} onClick={() => handleSelectAddress(address)}>
          {address.alias}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}