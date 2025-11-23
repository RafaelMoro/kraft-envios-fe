"use client"
import { useState } from "react";
import { Label, TextInput } from "flowbite-react"
import { HiChevronDown } from "react-icons/hi";

interface LadaPhoneStateDropdownProps {
  ladaState: string;
  errorLadaState: string;
  setLadaState: (lada: string) => void;
  updateLadaStateError: (message: string) => void;
}

export const LadaPhoneStateDropdown = ({ ladaState, errorLadaState, setLadaState, updateLadaStateError }: LadaPhoneStateDropdownProps) => {
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
    const inputValue = e.target.value
    
    // Validate that input only contains letters, and spaces
    const hasSpecialChars = /[^a-zA-Z\s]/.test(inputValue)
    
    if (hasSpecialChars) {
      updateLadaStateError('No se permiten caracteres especiales')
    }

    if (errorLadaState) updateLadaStateError('')
    setLadaState(inputValue)
  }

  return (
    <div className="relative">
      <div className="mb-2 flex flex-col gap-2">
        <Label htmlFor="content">Lada Estado de la República:</Label>
        {/* { errorLadaState && (
          <ErrorMessage>{errorLadaState}</ErrorMessage>
        )} */}
      </div>
      <TextInput
        data-testid="lada-state-autocomplete"
        id="lada-state-autocomplete"
        type="text"
        value={ladaState}
        onChange={handleChangeTerm}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Ropa"
        rightIcon={HiChevronDown}
        autoComplete="off"
      />
      { showDropdown && (
        <ul className="bg-gray-200 dark:bg-gray-800 w-full absolute z-50 border border-gray-300 dark:border-gray-500 p-2.5 rounded-lg max-h-52 overflow-y-auto">
          {/* { (isPending && searchProductSat.length > 0) && (<Spinner aria-label="loading suggestions sat product" />) }
          { (options.length === 0 && searchProductSat.length === 0 && !isPending)&& (
            <li className="p-2 rounded-lg">Escribe para buscar productos</li>
          )}
          { (options.length === 0 && searchProductSat.length > 0 && !isPending) && (
            <li className="p-2 rounded-lg">No se encontraron productos</li>
          )}
          { (options.length > 0 && !isPending) && options.map((opt) => (
            <li key={opt.code} onClick={() => handleSelectOption(opt)} className="hover:bg-gray-300 dark:hover:bg-gray-900 p-2 rounded-lg">{opt.description}</li>
          ))} */}
        </ul>
      )}
    </div>
  )
}