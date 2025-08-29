"use client"
import { useState } from "react"
import { Dropdown, DropdownItem } from "flowbite-react"

import { QUOTE_SOURCES, QuoteSource } from "@/shared/types/quotes.types"

interface SourceFilterDropdownProps {
  filterQuotesBySource: (source: QuoteSource) => void
  resetFiltersQuotes: () => void
}

export const SourceFilterDropdown = ({ filterQuotesBySource, resetFiltersQuotes }: SourceFilterDropdownProps) => {
  const allSources: QuoteSource[] = [...QUOTE_SOURCES]
  const [selectedSource, setSelectedSource] = useState<QuoteSource | null>(null)

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