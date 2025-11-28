"use client"
import { Dropdown, DropdownItem } from "flowbite-react"

import { QUOTE_SOURCES, ProviderSource } from "@/shared/types/quotes.types"

interface SourceFilterDropdownProps {
  selectedSource: ProviderSource | null
  setSelectedSource: (source: ProviderSource | null) => void
  filterQuotesBySource: (source: ProviderSource) => void
  resetFiltersQuotes: () => void
}

export const SourceFilterDropdown = ({ selectedSource, setSelectedSource, filterQuotesBySource, resetFiltersQuotes }: SourceFilterDropdownProps) => {
  const allSources: ProviderSource[] = [...QUOTE_SOURCES]

  const handleClick = (source: ProviderSource) => {
    setSelectedSource(source)
    filterQuotesBySource(source)
  }

  const selectAllSources = () => {
    setSelectedSource(null)
    resetFiltersQuotes()
  }
  
  return (
    <Dropdown label={`Origen: ${selectedSource || "Todos"}`} inline>
      { allSources.map((source) => (
        <DropdownItem key={source} onClick={() => handleClick(source)}>
          {source}
        </DropdownItem>
      )) }
      <DropdownItem onClick={selectAllSources}>
        Todos
      </DropdownItem>
    </Dropdown>
  )
}