"use client"
import { useState, useEffect } from "react"
import { Label, Spinner, TextInput } from "flowbite-react"
import { useMutation } from "@tanstack/react-query"
import { HiChevronDown } from "react-icons/hi"

import { getProductSatInfo } from "@/shared/utils/guides.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { GetProductSatIdPayload, SearchProduct } from "@/shared/types/guides.types"

interface ProductSatDropdownProps {
  searchProductSat: string
  errorProductSat: string
  setSearchProductSat: (term: string) => void
  updateSelectedOption: (option: SearchProduct) => void
  updateErrorProductSat: (message: string) => void
}

export const ProductSatDropdown = ({ searchProductSat, errorProductSat, setSearchProductSat, updateSelectedOption, updateErrorProductSat }: ProductSatDropdownProps) => {
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

  const handleChangeTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If the user writes or deletes the term, then set the flag to false
    if (hasSelectedOption) setHasSelectedOption(false)
    if (errorProductSat) updateErrorProductSat('')
    setSearchProductSat(e.target.value)
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
    if (!searchProductSat.trim() || hasSelectedOption) return

    const timeoutId = setTimeout(() => {
      const payload: GetProductSatIdPayload = { search: searchProductSat }
      getProducts(payload)
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [searchProductSat, hasSelectedOption, getProducts])

  // Update options based on the data received
  useEffect(() => {
    if (data) {
      const products = data?.data?.products || []
      setOptions(products)
    }
  }, [data])

  const handleSelectOption = (option: SearchProduct) => {
    updateSelectedOption(option)
    setSearchProductSat(option.description)
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
        value={searchProductSat}
        onChange={handleChangeTerm}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Ropa"
        rightIcon={HiChevronDown}
        autoComplete="off"
      />
      { showDropdown && (
        <ul className="bg-gray-200 dark:bg-gray-800 w-full absolute z-50 border border-gray-300 dark:border-gray-500 p-2.5 rounded-lg max-h-52 overflow-y-auto">
          { (isPending && searchProductSat.length > 0) && (<Spinner aria-label="loading suggestions sat product" />) }
          { (options.length === 0 && searchProductSat.length === 0 && !isPending)&& (
            <li className="p-2 rounded-lg">Escribe para buscar productos</li>
          )}
          { (options.length === 0 && searchProductSat.length > 0 && !isPending) && (
            <li className="p-2 rounded-lg">No se encontraron productos</li>
          )}
          { (options.length > 0 && !isPending) && options.map((opt) => (
            <li key={opt.code} onClick={() => handleSelectOption(opt)} className="hover:bg-gray-300 dark:hover:bg-gray-900 p-2 rounded-lg">{opt.description}</li>
          ))}
        </ul>
      ) }
    </div>
  )
}