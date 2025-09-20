import { Dropdown, DropdownItem } from "flowbite-react"

export const ProductSatDropdown = () => {
  return (
    <Dropdown label={`Producto:`} inline>
      <DropdownItem>
        Todos
      </DropdownItem>
    </Dropdown>
  )
}