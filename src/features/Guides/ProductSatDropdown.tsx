"use client"
import { useState, useEffect } from "react"
import { Label, TextInput } from "flowbite-react"
import { useMutation } from "@tanstack/react-query"
import { HiChevronDown } from "react-icons/hi"

import { getProductSatInfo } from "@/shared/utils/guides.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { GetProductSatIdPayload, SearchProduct } from "@/shared/types/guides.types"

interface ProductSatDropdownProps {
  updateSelectedOption: (option: SearchProduct) => void
}

export const ProductSatDropdown = ({ updateSelectedOption }: ProductSatDropdownProps) => {
  // Flag to check if an option has been selected and prevent fetching term
  const [hasSelectedOption, setHasSelectedOption] = useState<boolean>(false)

  // Dropdown visibility state
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const handleInputFocus = () => {
    setShowDropdown(true)
  }
  const handleInputBlur = () => {
    // Add a small delay to allow option selection to complete before closing dropdown
    setTimeout(() => {
      setShowDropdown(false)
    }, 150)
  }

  // Search term state
  const [searchTerm, setSearchTerm] = useState<string>("")
  const handleChangeTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If the user writes or deletes the term, then set the flag to false
    if (hasSelectedOption) setHasSelectedOption(false)
    setSearchTerm(e.target.value)
  }

  // Options state
  const [options, setOptions] = useState<SearchProduct[]>([])

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
    if (!searchTerm.trim() || hasSelectedOption) return

    const timeoutId = setTimeout(() => {
      const payload: GetProductSatIdPayload = { search: searchTerm }
      getProducts(payload)
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, hasSelectedOption, getProducts])

  // Update options based on the data received
  useEffect(() => {
    if (data) {
      const products = data?.data?.products || []
      setOptions(products)
    }
  }, [data])

  const handleSelectOption = (option: SearchProduct) => {
    updateSelectedOption(option)
    setSearchTerm(option.description)
    setHasSelectedOption(true)
  }

  return (
    <div className="relative">
      <div className="mb-2 block">
        <Label htmlFor="content">Tipo de producto:</Label>
      </div>
      <TextInput
        data-testid="product-autocomplete"
        id="product-autocomplete"
        type="text"
        value={searchTerm}
        onChange={handleChangeTerm}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Ropa"
        rightIcon={HiChevronDown}
        autoComplete="off"
      />
      { showDropdown && (
        <ul className="bg-gray-200 dark:bg-gray-800 w-full absolute z-50 border border-gray-300 dark:border-gray-500 p-2.5 rounded-lg max-h-52 overflow-y-auto">
          { options.length === 0 && searchTerm.length === 0 && (
            <li className="p-2 rounded-lg">Escribe para buscar productos</li>
          )}
          { (options.length === 0 && searchTerm.length > 0) && (
            <li className="p-2 rounded-lg">No se encontraron productos</li>
          )}
          { options.length > 0 && options.map((opt) => (
            <li key={opt.code} onClick={() => handleSelectOption(opt)} className="hover:bg-gray-300 dark:hover:bg-gray-900 p-2 rounded-lg">{opt.description}</li>
          ))}
        </ul>
      ) }
    </div>
  )
}