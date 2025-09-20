"use client"
import { useState } from "react"
import { Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"

export const ProductSatDropdown = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const handleChangeTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

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
            value={searchTerm}
            onChange={handleChangeTerm}
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