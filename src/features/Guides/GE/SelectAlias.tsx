"use client"
import { useQuery } from "@tanstack/react-query"
import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react"

import { getAliasAddressesCb } from "@/shared/utils/guides.utils"

interface SelectAliasGEProps {
  alias: string | null
  setAlias: (term: string) => void
}

export const SelectAliasGE = ({ setAlias, alias }: SelectAliasGEProps) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['aliasAddresses'],
    queryFn: getAliasAddressesCb
  })

  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <Button
          className="hover:cursor-pointer flex justify-between"
          color="light"
          disabled={isPending || isError || data?.length === 0}
        >
          { isPending && (<Spinner />)}
          { (isError && !isPending) && ("No se ha podido cargar los alias")}
          { (!isPending && data && !alias) && "Alias de domicilio"}
          { (!isPending && Boolean(data) && Boolean(alias)) && alias}
          <RiArrowDownSLine />
        </Button>
      )}
    >
      { (data && data?.length > 0 )&& data.map((alias) => (
        <DropdownItem key={`alias-${alias}`} onClick={() => setAlias(alias)}>
          {alias}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}