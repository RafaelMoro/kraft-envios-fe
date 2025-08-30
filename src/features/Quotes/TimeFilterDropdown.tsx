"use client"
import { Dropdown, DropdownItem } from "flowbite-react"
import { QUOTE_SERVICE_TYPES, QuoteTypeService } from "@/shared/types/quotes.types"

interface TimeFilterDropdownProps {
  selectedType: QuoteTypeService | null
  setSelectedType: (type: QuoteTypeService | null) => void
  filterQuotesByType: (type: QuoteTypeService) => void
  resetFiltersQuotes: () => void
}

export const TimeFilterDropdown = ({ selectedType, setSelectedType, filterQuotesByType, resetFiltersQuotes }: TimeFilterDropdownProps) => {
  const allServiceTypes: QuoteTypeService[] = [...QUOTE_SERVICE_TYPES]

  const serviceTypeLabels: Record<QuoteTypeService, string> = {
    standard: 'Standard',
    nextDay: 'Siguiente día'
  }

  const handleClick = (type: QuoteTypeService) => {
    setSelectedType(type)
    filterQuotesByType(type)
  }

  const selectAllSources = () => {
    setSelectedType(null)
    resetFiltersQuotes()
  }

  return (
    <Dropdown label={`Tiempo de entrega: ${selectedType ? serviceTypeLabels[selectedType] : "Todos"}`} inline>
      { allServiceTypes.map((type) => (
        <DropdownItem key={type} onClick={() => handleClick(type)}>
          {serviceTypeLabels[type]}
        </DropdownItem>
      )) }
      <DropdownItem onClick={selectAllSources}>
        Todos
      </DropdownItem>
    </Dropdown>
  )
}