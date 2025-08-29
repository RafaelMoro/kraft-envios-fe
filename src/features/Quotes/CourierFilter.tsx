"use client"
import { useState } from "react"
import { Dropdown, DropdownItem } from "flowbite-react"

import type { QuoteCourier } from "../../shared/types/quotes.types"
import { QUOTE_COURIERS } from "../../shared/types/quotes.types"

export const CourierFilter = () => {
  const allCouriers: QuoteCourier[] = [...QUOTE_COURIERS]
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>(null)


  return (
    <Dropdown label={`Proveedor: ${selectedCourier || "Todos"}`} inline>
      { allCouriers.map((courier) => (
        <DropdownItem key={courier} onClick={() => setSelectedCourier(courier)}>
          {courier}
        </DropdownItem>
      )) }
    </Dropdown>
  )
}