"use client"
import { ChangeEvent, useState, useEffect, useCallback } from "react"
import { Button, Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { RiArchiveLine, RiArrowDownSLine, RiDeleteBinLine } from "@remixicon/react"

import { QUOTE_COURIERS, QuoteCourier } from "@/shared/types/quotes.types"
import { CourierForm, ProfitMarginTypeOption } from "@/shared/types/margin-profit.types"

interface CourierProfitMarginFormProps {
  id: string
  courierFormsDataLoaded: CourierForm | null
  onRemove: (id: string) => void
  changeCourier: (newCourier: QuoteCourier, id: string) => void
  updateValue: (newValue: number | null, id: string) => void
  updateProfitMarginType: (value: "percentage" | "absolute", id: string) => void
}

export const CourierProfitMarginForm = ({ id, courierFormsDataLoaded, onRemove, changeCourier, updateValue, updateProfitMarginType }: CourierProfitMarginFormProps) => {
  const allCouriers = [...QUOTE_COURIERS]
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>(courierFormsDataLoaded?.courier ??'Fedex')
  const [value, setValue] = useState<string>(courierFormsDataLoaded?.value?.toString() ?? "")
  
  const updateCourier = (newCourier: QuoteCourier) => {
    setSelectedCourier(newCourier)
    changeCourier(newCourier, id)
  }

  // Debounced update value function
  const debouncedUpdateValue = useCallback((newValue: string) => {

    const timeoutId = setTimeout(() => {
      if (!newValue) {
        updateValue(null, id)
        return
      }
      updateValue(Number(newValue), id)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [updateValue, id])

  // Effect to handle debounced value updates
  useEffect(() => {
    const cleanup = debouncedUpdateValue(value)
    return cleanup
  }, [value, debouncedUpdateValue])

  const [profitMarginType, setProfitMarginType] = useState<ProfitMarginTypeOption>(courierFormsDataLoaded?.profitMarginType ??{
    label: 'Porcentaje',
    value: 'percentage'
  })
  const handleProfitMarginType = (value: 'percentage' | 'absolute') => {
    if (value === 'percentage') {
      setProfitMarginType({
        label: 'Porcentaje',
        value: 'percentage'
      })
      updateProfitMarginType('percentage', id)
      return
    }

    setProfitMarginType({
      label: 'Absoluto',
      value: 'absolute'
    })
    updateProfitMarginType('absolute', id)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setValue(newValue)
    // The debounced update will be handled by the useEffect
  }

  return (
    <article
      className="w-full mx-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 grid grid-cols-2 gap-x-2 gap-y-5"
    >
      <div className="col-span-2 w-full flex justify-between">
        <div className="flex items-center gap-2 mb-3">
          <RiArchiveLine />
          <h5 className="text-lg">{selectedCourier}</h5>
        </div>
        <button data-testid={`remove-courier-${id}`} className="text-red-600 cursor-pointer" onClick={() => onRemove(id)}>
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
          data-testid={`profit-margin-value-${id}`}
          value={value}
          onChange={(e) => handleChange(e)}
        />
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
        <DropdownItem onClick={() => handleProfitMarginType('percentage')}>Porcentaje</DropdownItem>
        <DropdownItem onClick={() => handleProfitMarginType('absolute')}>Absoluto</DropdownItem>
      </Dropdown>
    </article>
  )
}