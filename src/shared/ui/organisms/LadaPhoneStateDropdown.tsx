"use client"
import { useState } from "react";
import { Label, TextInput } from "flowbite-react"
import { HiChevronDown, HiChevronRight } from "react-icons/hi";
import { LADAS_MEXICO } from "@/shared/constants/lada-states.constants";

interface LadaPhoneStateDropdownProps {
  ladaState: string;
  errorLadaState: string;
  setLadaState: (lada: string) => void;
  updateLadaStateError: (message: string) => void;
}

export const LadaPhoneStateDropdown = ({ ladaState, errorLadaState, setLadaState, updateLadaStateError }: LadaPhoneStateDropdownProps) => {
  const options = [...LADAS_MEXICO]
  const [filteredOptions, setFilteredOptions] = useState<typeof LADAS_MEXICO>(options)

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
    
    // Validate that input only contains letters, numbers, spaces, and plus sign
    const hasSpecialChars = /[^a-zA-Z0-9\s+]/.test(inputValue)
    
    if (hasSpecialChars) {
      updateLadaStateError('No se permiten caracteres especiales')
    }

    if (errorLadaState) updateLadaStateError('')
    setLadaState(inputValue)

    // Filter options based on input
    if (inputValue.trim() === '') {
      // Show all options when input is empty
      setFilteredOptions(options)
    } else {
      // Detect if input contains numbers or plus sign (filter by lada) or only letters (filter by state)
      const hasNumericInput = /[0-9+]/.test(inputValue)
      
      if (hasNumericInput) {
        // Filter by lada code
        const numericInput = inputValue.replace(/[^0-9]/g, '') // Remove plus sign and spaces
        const filtered = options.filter((opt) =>
          opt.lada.some((l) => l.startsWith(numericInput))
        )
        setFilteredOptions(filtered)
      } else {
        // Filter by state name
        const filtered = options.filter((opt) =>
          opt.state.toLowerCase().includes(inputValue.toLowerCase())
        )
        setFilteredOptions(filtered)
      }
    }
  }

  const handleSelectOption = (option: typeof LADAS_MEXICO[0]) => {
    setLadaState(option.state)
    setShowDropdown(false)
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
        data-testid="lada-phone-autocomplete"
        name="lada-phone-autocomplete"
        id="lada-phone-autocomplete"
        type="text"
        value={ladaState}
        onChange={handleChangeTerm}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Ciudad de México"
        rightIcon={HiChevronDown}
        // Setting this way the autocomplete to avoid Chrome to autocomplete addresses even with "off" value
        autoComplete="lada-phone-autocomplete"
      />
      { showDropdown && (
        <ul className="bg-gray-200 dark:bg-gray-800 w-full absolute z-50 border border-gray-300 dark:border-gray-500 p-2.5 rounded-lg max-h-52 overflow-y-auto">
          { (filteredOptions.length === 0 && ladaState.length > 0) && (
            <li className="p-2 rounded-lg">No se encontraron resultados</li>
          )}
          { (filteredOptions.length > 0) && filteredOptions.map((opt) => (
            <li
              key={opt.state}
              onClick={() => handleSelectOption(opt)}
              className="hover:bg-gray-300 dark:hover:bg-gray-900 p-2 rounded-lg inline-flex gap-2 cursor-pointer"
            >
              {opt.state} {opt.lada.map(lada => `+${lada}`).join(' | ')}
              <HiChevronRight />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}