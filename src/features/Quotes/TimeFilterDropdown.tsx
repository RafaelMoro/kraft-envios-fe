import { QUOTE_SERVICE_TYPES, QuoteTypeService } from "@/shared/types/quotes.types"
import { Dropdown, DropdownItem } from "flowbite-react"
import { useState } from "react"

interface TimeFilterDropdownProps {
  filterQuotesByType: (type: QuoteTypeService) => void
  resetFiltersQuotes: () => void
}

export const TimeFilterDropdown = ({ filterQuotesByType, resetFiltersQuotes }: TimeFilterDropdownProps) => {
  const allServiceTypes: QuoteTypeService[] = [...QUOTE_SERVICE_TYPES]
  const [selectedType, setSelectedType] = useState<QuoteTypeService | null>(null)

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