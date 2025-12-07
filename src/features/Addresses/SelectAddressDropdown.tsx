import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react"
import { RiArrowDownSLine } from "@remixicon/react"

import { useGetAddress } from "@/shared/hooks/useGetAddress"

interface SelectAddressDropdownProps {
  aliasSelected: string
  setAliasSelected: (alias: string) => void
}

export const SelectAddressDropdown = ({ aliasSelected, setAliasSelected }: SelectAddressDropdownProps) => {
  const { aliases, isPending, isError } = useGetAddress()

  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <Button
          className="hover:cursor-pointer flex justify-between"
          color="light"
          disabled={isPending || isError || aliases.length === 0}
        >
          { isPending && (<Spinner />)}
          { (isError && !isPending) && ("No se han podido cargar los alias")}
          { (!isPending && aliases.length > 0 && !aliasSelected) && 'Alias de dirección'}
          { (!isPending && aliases.length > 0 && aliasSelected) && aliasSelected}
          <RiArrowDownSLine />
        </Button>
      )}
    >
      { (aliases && aliases.length > 0 )&& aliases.map((alias) => (
        <DropdownItem key={`alias-${alias}`} onClick={() => setAliasSelected(alias)}>
          {alias}
        </DropdownItem>
      )) }
      <DropdownItem>
        Direccion prueba
      </DropdownItem>
    </Dropdown>
  )
}