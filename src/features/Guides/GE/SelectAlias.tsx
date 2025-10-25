import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem } from "flowbite-react"
import { useState } from "react"

interface SelectAliasGEProps {
  alias: string | null
  setAlias: (term: string) => void
}

export const SelectAliasGE = ({ alias, setAlias }: SelectAliasGEProps) => {
  const [allAliases, setAllAliases] = useState<string[]>([])

  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <Button
          className="hover:cursor-pointer flex justify-between"
          color="light"
        >
          {alias ?? "Alias de domicilio"}
          <RiArrowDownSLine />
        </Button>
      )}
    >
      { allAliases.length > 0 && allAliases.map((alias) => (
        <DropdownItem key={`alias-${alias}`} onClick={() => setAlias(alias)}>
          {alias}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}