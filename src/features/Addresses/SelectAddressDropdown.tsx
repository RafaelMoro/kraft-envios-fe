import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem } from "flowbite-react"

export const SelectAddressDropdown = () => {
  const { aliases, isPending, isError } = useGetAddress()
  console.log({ aliases })

  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <Button
          className="hover:cursor-pointer flex justify-between"
          color="light"
          disabled={isPending || isError || aliases.length === 0}
        >
          {/* { isPending && (<Spinner />)}
          { (isError && !isPending) && ("No se ha podido cargar los alias")}
          { (!isPending && data && !alias) && "Alias de domicilio"}
          { (!isPending && Boolean(data) && Boolean(alias)) && alias} */}
          Seleccionar dirección
          <RiArrowDownSLine />
        </Button>
      )}
    >
      {/* { (data && data?.length > 0 )&& data.map((alias) => (
        <DropdownItem key={`alias-${alias}`} onClick={() => setAlias(alias)}>
          {alias}
        </DropdownItem>
      )) } */}
      <DropdownItem>
        Direccion prueba
      </DropdownItem>
    </Dropdown>
  )
}