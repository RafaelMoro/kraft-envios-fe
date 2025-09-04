"use client"
import { useRef, useState } from "react"
import { Button, Card, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { useMutation } from "@tanstack/react-query"
import { RiAddLine, RiArchiveLine, RiArrowDownSLine, RiErrorWarningLine } from "@remixicon/react"

import { CourierForm, ProfitMargin, ProfitMarginTypeOption, ProviderGlobalConfig, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types"
import { hasDuplicateCouriersFn, updateMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { QUOTE_SOURCES, QuoteCourier, QuoteSource } from "@/shared/types/quotes.types"
import { CourierProfitMarginForm } from "./CourierProfitMarginForm"
import { createUniqueId } from "@/shared/utils/global.utils"

interface ProfitMarginFormProps {
  refetchMarginProfit: () => Promise<void>
  data: ProviderGlobalConfig[] | null | undefined
}

export const ProfitMarginForm = ({ refetchMarginProfit }: ProfitMarginFormProps) => {
  const allProviders = [...QUOTE_SOURCES]
  const [courierForms, setCourierForms] = useState<string []>([])
  const [emptyCouriersError, setEmptyCouriersError] = useState<string | null>(null)
  const courierFormsData = useRef<CourierForm[]>([])
  const [selectedProvider, setSelectedProvider] = useState<QuoteSource | null>('GE')

  const updateProvider = (newProv: QuoteSource) => setSelectedProvider(newProv)
  const addCourierForm = () => {
    if (emptyCouriersError) setEmptyCouriersError(null)
    const newId = createUniqueId()
    const initialState: CourierForm = {
      id: newId,
      value: 0,
      courier: 'Fedex',
      profitMarginType: {
        label: 'Porcentaje',
        value: 'percentage'
      }
    }
    courierFormsData.current.push(initialState)
    setCourierForms((prev) => [...prev, newId])
  }
  const changeSelectedCourier = (newCourier: QuoteCourier, id: string) => {
    const form = courierFormsData.current.find((form) => form.id === id)
    if (!form) {
      console.warn('Form not found to change selected courier')
      return
    }
    const updatedForm = { ...form, courier: newCourier }
    const filteredForms = courierFormsData.current.filter((form) => form.id !== id)
    courierFormsData.current = [...filteredForms, updatedForm]
  }
  const updateValue = (newValue: number | null, id: string) => {
    const form = courierFormsData.current.find((form) => form.id === id)
    if (!form) {
      console.warn('Form not found to change profit margin type')
      return
    }
    const updatedForm = { ...form, value: newValue }
    const filteredForms = courierFormsData.current.filter((form) => form.id !== id)
    courierFormsData.current = [...filteredForms, updatedForm]
  }
  const updateProfitMarginTypeFromCourierForm = (value: 'percentage' | 'absolute', id: string) => {
    const form = courierFormsData.current.find((form) => form.id === id)
    if (!form) {
      console.warn('Form not found to change profit margin type')
      return
    }
    const newValue: ProfitMarginTypeOption = {
      label: value === 'percentage' ? 'Porcentaje' : 'Absoluto',
      value: value === 'percentage' ? 'percentage' : 'absolute'
    }
    const updatedForm = { ...form, profitMarginType: newValue }
    const filteredForms = courierFormsData.current.filter((form) => form.id !== id)
    courierFormsData.current = [...filteredForms, updatedForm]
  }
  const removeCourierForm = (id: string) => {
    const filteredData = courierFormsData.current.filter((courier) => courier.id !== id)
    courierFormsData.current = filteredData
    const filteredForms = courierForms.filter((form) => form !== id)
    setCourierForms(filteredForms)
  }

  const { isPending } = useMutation<ProfitMargin, GeneralApiError, UpdateMarginProfitPayload>({
    mutationFn: updateMarginProfitCb,
    onSuccess: async () => {
      await refetchMarginProfit()
    }
  })

  const handleSubmit = () => {
    // Validation errors
    if (courierFormsData.current.length === 0) {
      setEmptyCouriersError('Debe agregar al menos una paquetería')
      return
    }
    const duplicatedCouriers = hasDuplicateCouriersFn(courierFormsData.current)
    if (duplicatedCouriers.length > 0) {
      const duplicatesStr = duplicatedCouriers.join(', ')
      setEmptyCouriersError(`No se permiten paqueterías duplicadas: ${duplicatesStr}`)
      return
    }

    for (const courier of courierFormsData.current) {

      if (!courier.value) {
        if (emptyCouriersError) return
        const msg = `El valor del margen de ganancia es obligatorio para la paquetería ${courier.courier}`
        setEmptyCouriersError(msg)
        return
      }

      if (courier.value <= 0) {
        if (emptyCouriersError) return
        const msg = `El valor del margen de ganancia debe ser mayor a 0 para la paquetería ${courier.courier}`
        setEmptyCouriersError(msg)
        return
      }
    }

    // Reset errors
    if (emptyCouriersError) setEmptyCouriersError(null)

    console.log('courierFormsData', courierFormsData.current)
    // const payload: UpdateMarginProfitPayload = {
    //   profitMargin: {
    //     value: data.value,
    //     type: profitMarginType.value
    //   }
    // }
    // mutate(payload)
  }

  return (
    <form
      className="flex flex-col w-full justify-center gap-12 mx-auto"
    >
      <div className="flex flex-col gap-3">
        <h4 className="text-2xl font-semibold mb-4 text-center">Configuración por proveedor</h4>
        <p className="text-center text-gray-600 dark:text-gray-400">Configure los margenes de ganancia por paquetería y por proveedor</p>
      </div>
      <Card className="max-w-lg mx-auto w-full">
        <Label htmlFor="provider-value" className="text-xl">Seleccione el proveedor:</Label>
        <Dropdown label={selectedProvider} renderTrigger={() => (
          <Button
            className="w-full hover:cursor-pointer flex justify-between"
            color="light"
          >
            {selectedProvider}
            <RiArrowDownSLine />
          </Button>
        )}>
          {allProviders.map((provider) => (
            <DropdownItem key={provider} onClick={() => updateProvider(provider)}>
              {provider}
            </DropdownItem>
          ))}
        </Dropdown>
      </Card>
      <Card className="max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h5 className="text-xl mb-4">Configuración de la paquetería</h5>
          <Button
            className="hover:cursor-pointer inline-flex gap-1"
            color="light"
            onClick={addCourierForm}
          >
            <RiAddLine />
            Agregar paquetería
          </Button>
        </div>

        { courierForms.length === 0 && (
          <div className="flex flex-col gap-3 justify-center items-center mt-10">
            <span className="text-gray-600 dark:text-gray-400">
              <RiArchiveLine size={40} />
            </span>
            <p className="text-lg text-center">No ha agregado ninguna paquetería</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">De click en &quot;Agregar paquetería&quot; para añadir una nueva configuración.</p>
          </div>
        )}
        { courierForms.length > 0 && (
          <div className="flex flex-col gap-3 justify-center items-center mt-10">
            { courierForms.map((id) => (
              <CourierProfitMarginForm
                key={id}
                id={id}
                onRemove={removeCourierForm}
                changeCourier={changeSelectedCourier}
                updateProfitMarginType={updateProfitMarginTypeFromCourierForm}
                updateValue={updateValue}
              />
            ))}
          </div>
        ) }
      </Card>

      { emptyCouriersError && (
        <Card className="max-w-lg mx-auto">
          <div className="flex gap-2 justify-center text-red-500">
            <RiErrorWarningLine />
            <p className="text-center font-semibold text-base">{emptyCouriersError}</p>
          </div>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          className="hover:cursor-pointer"
          disabled={isPending}
          type="button"
          onClick={handleSubmit}
        >
          { isPending ? (<Spinner aria-label="loading updating margin profit" />) : 'Guardar configuración' }
        </Button>
      </div>
    </form>
  )
}