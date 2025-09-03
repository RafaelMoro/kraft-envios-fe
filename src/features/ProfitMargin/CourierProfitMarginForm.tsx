"use client"
import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { RiArchiveLine, RiArrowDownSLine, RiDeleteBinLine } from "@remixicon/react"

import { QUOTE_COURIERS, QuoteCourier } from "@/shared/types/quotes.types"
import { ProfitMarginTypeOption } from "@/shared/types/margin-profit.types"

interface CourierProfitMarginFormProps {
  id: string
  onRemove: (id: string) => void
}

export const CourierProfitMarginForm = ({ id, onRemove }: CourierProfitMarginFormProps) => {
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
      className="w-full mx-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 grid grid-cols-2 gap-x-2 gap-y-5"
    >
      <div className="col-span-2 w-full flex justify-between">
        <div className="flex items-center gap-2 mb-3">
          <RiArchiveLine />
          <h5 className="text-lg">{selectedCourier}</h5>
        </div>
        <button className="text-red-600" onClick={() => onRemove(id)}>
          <RiDeleteBinLine />
        </button>
      </div>
      <div className="w-full col-span-2 flex flex-col gap-2">
        <Label>Paquetería:</Label>
        <Dropdown label="" renderTrigger={() => (
          <Button
            className="hover:cursor-pointer flex justify-between"
            color="light"
          >
            {selectedCourier}
            <RiArrowDownSLine />
          </Button>
        )}>
          {allCouriers.map((courier) => (
            <DropdownItem key={courier} onClick={() => updateCourier(courier)}>
              {courier}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <div className="col-span-2 md:col-span-1">
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
      <Dropdown label="" renderTrigger={() => (
        <Button
          className="w-full col-span-2 md:col-span-1 place-self-end hover:cursor-pointer flex justify-between"
          color="light"
        >
          {profitMarginType.label}
          <RiArrowDownSLine />
        </Button>
      )}>
        <DropdownItem onClick={() => updateProfitMarginType('percentage')}>Porcentaje</DropdownItem>
        <DropdownItem onClick={() => updateProfitMarginType('absolute')}>Absoluto</DropdownItem>
      </Dropdown>
    </form>
  )
}