import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem } from "flowbite-react"
import { getAliasAddressesCb } from "@/shared/utils/guides.utils"

interface SelectAliasGEProps {
  alias: string | null
  setAlias: (term: string) => void
}

export const SelectAliasGE = ({ alias, setAlias }: SelectAliasGEProps) => {
  const [allAliases, setAllAliases] = useState<string[]>([])

  const { data, isPending, isError } = useQuery({
    queryKey: ['aliasAddresses'],
    queryFn: getAliasAddressesCb
  })
  console.log('data', data)

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