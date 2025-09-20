"use client"
import { useState } from "react"
import { Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { getProductSatInfo } from "@/shared/utils/guides.utils"
import { useMutation } from "@tanstack/react-query"
import { GeneralApiError } from "@/shared/types/global.types"
import { GetProductSatIdPayload } from "@/shared/types/guides.types"

export const ProductSatDropdown = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const handleChangeTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutate: getProducts, isPending, data } = useMutation<any, GeneralApiError, GetProductSatIdPayload>({
    mutationFn: getProductSatInfo,
  })

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