"use client"
import { useState } from "react"
import { Dropdown, DropdownItem } from "flowbite-react"

import type { QuoteCourier } from "../../shared/types/quotes.types"
import { QUOTE_COURIERS } from "../../shared/types/quotes.types"

interface CourierFilterProps {
  filterQuotesByCourier: (courier: QuoteCourier) => void
}

export const CourierFilter = ({ filterQuotesByCourier }: CourierFilterProps) => {
  const allCouriers: QuoteCourier[] = [...QUOTE_COURIERS]
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>(null)

  const handleClick = (courier: QuoteCourier) => {
    setSelectedCourier(courier)
    filterQuotesByCourier(courier)
  }

  return (
    <Dropdown label={`Proveedor: ${selectedCourier || "Todos"}`} inline>
      { allCouriers.map((courier) => (
        <DropdownItem key={courier} onClick={() => handleClick(courier)}>
          {courier}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}