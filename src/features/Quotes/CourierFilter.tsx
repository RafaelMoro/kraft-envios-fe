"use client"
import { Dropdown, DropdownItem } from "flowbite-react"

import type { QuoteCourier } from "../../shared/types/quotes.types"
import { QUOTE_COURIERS } from "../../shared/types/quotes.types"

interface CourierFilterProps {
  selectedCourier: QuoteCourier | null
  setSelectedCourier: (courier: QuoteCourier | null) => void
  filterQuotesByCourier: (courier: QuoteCourier) => void
  resetFiltersQuotes: () => void
}

export const CourierFilter = ({ selectedCourier, setSelectedCourier, filterQuotesByCourier, resetFiltersQuotes }: CourierFilterProps) => {
  const allCouriers: QuoteCourier[] = [...QUOTE_COURIERS]

  const handleClick = (courier: QuoteCourier) => {
    setSelectedCourier(courier)
    filterQuotesByCourier(courier)
  }
  const selectAllCouriers = () => {
    setSelectedCourier(null)
    resetFiltersQuotes()
  }

  return (
    <Dropdown label={`Proveedor: ${selectedCourier || "Todos"}`} inline>
      { allCouriers.map((courier) => (
        <DropdownItem key={courier} onClick={() => handleClick(courier)}>
          {courier}
        </DropdownItem>
      )) }
      <DropdownItem onClick={selectAllCouriers}>
        Todos
      </DropdownItem>
    </Dropdown>
  )
}