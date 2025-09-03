"use client"
import { useState } from "react"

import { QUOTE_COURIERS, QuoteCourier } from "@/shared/types/quotes.types"
import { Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { ProfitMarginTypeOption } from "@/shared/types/margin-profit.types"

export const ProfitMarginForm = () => {
  const allCouriers = [...QUOTE_COURIERS]
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>('Fedex')
  const updateCourier = (newCourier: QuoteCourier) => setSelectedCourier(newCourier)

  const [profitMarginType, setProfitMarginType] = useState<ProfitMarginTypeOption>({
      label: 'Porcentaje',
      value: 'percentage'
    })
  const updateProfitMarginType = (value: 'percentage' | 'absolute') => {
    if (value === 'percentage') {
      setProfitMarginType({
        label: 'Porcentaje',
        value: 'percentage'
      })
      return
    }

    setProfitMarginType({
      label: 'Absoluto',
      value: 'absolute'
    })
  }

  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center mx-auto"
    >
      <Dropdown label={`Paquetería: ${selectedCourier}`} inline>
        {allCouriers.map((courier) => (
          <DropdownItem key={courier} onClick={() => updateCourier(courier)}>
            {courier}
          </DropdownItem>
        ))}
      </Dropdown>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="value">Valor</Label>
        </div>
        <TextInput
          id="value"
          type="number"
          inputMode="numeric"
          defaultValue={0}
          // {...register("value")}
        />
        {/* { errors.value?.message && (
          <ErrorMessage>{errors.value?.message}</ErrorMessage>
        )} */}
      </div>
      <Dropdown label={`Tipo: ${profitMarginType.label}`} inline>
        <DropdownItem onClick={() => updateProfitMarginType('percentage')}>Porcentaje</DropdownItem>
        <DropdownItem onClick={() => updateProfitMarginType('absolute')}>Absoluto</DropdownItem>
      </Dropdown>
    </form>
  )
}