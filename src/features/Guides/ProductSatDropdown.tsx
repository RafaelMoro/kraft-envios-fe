"use client"
import { useState, useEffect } from "react"
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

  const {
    mutate: getProducts,
    isPending,
    data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useMutation<any, GeneralApiError, GetProductSatIdPayload>({
    mutationFn: getProductSatInfo,
  })

  // Debounce searchTerm and trigger getProducts after 2 seconds
  useEffect(() => {
    if (!searchTerm.trim()) return

    const timeoutId = setTimeout(() => {
      const payload: GetProductSatIdPayload = { search: searchTerm }
      getProducts(payload)
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, getProducts])

  // Log data when it changes
  useEffect(() => {
    if (data) {
      console.log('Product SAT data received:', data)
    }
  }, [data])

  return (
    <>
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
      <Dropdown
        label="Hola"
        // renderTrigger={() => (
        // )}
      >
        <DropdownItem>
          Todos
        </DropdownItem>
      </Dropdown>
    </>
  )
}