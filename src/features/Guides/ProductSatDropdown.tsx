"use client"
import { Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"

export const ProductSatDropdown = () => {
  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="content">Tipo de producto:</Label>
          </div>
          <TextInput
            data-testid="product-autocomplete"
            id="product-autocomplete"
            type="text"
            placeholder="Ropa"
          />
        </div>
      )}
    >
      <DropdownItem>
        Todos
      </DropdownItem>
    </Dropdown>
  )
}