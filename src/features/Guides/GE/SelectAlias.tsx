"use client"
import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react"

interface SelectAliasGEProps {
  alias: string | null
  data: string[] | undefined
  isPending: boolean
  isError: boolean
  setAlias: (term: string) => void
}

export const SelectAliasGE = ({ setAlias, alias, data, isPending, isError }: SelectAliasGEProps) => {

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
      <div className="overflow-y-auto max-h-52">
        { (data && data?.length > 0 )&& data.map((alias) => (
          <DropdownItem key={`alias-${alias}`} onClick={() => setAlias(alias)}>
            {alias}
          </DropdownItem>
        )) }
      </div>
    </Dropdown>
  )
}