"use client"
import { Dropdown, DropdownItem } from "flowbite-react"

import { QUOTE_SOURCES, QuoteSource } from "@/shared/types/quotes.types"

interface SourceFilterDropdownProps {
  selectedSource: QuoteSource | null
  setSelectedSource: (source: QuoteSource | null) => void
  filterQuotesBySource: (source: QuoteSource) => void
  resetFiltersQuotes: () => void
}

export const SourceFilterDropdown = ({ selectedSource, setSelectedSource, filterQuotesBySource, resetFiltersQuotes }: SourceFilterDropdownProps) => {
  const allSources: QuoteSource[] = [...QUOTE_SOURCES]

  const handleClick = (source: QuoteSource) => {
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