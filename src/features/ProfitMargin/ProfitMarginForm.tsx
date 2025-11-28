"use client"
import { useEffect, useRef, useState } from "react"
import { Button, Card, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { useMutation } from "@tanstack/react-query"
import { RiAddLine, RiArchiveLine, RiArrowDownSLine, RiErrorWarningLine } from "@remixicon/react"

import { CourierForm, MarginProfitSubscreens, ProfitMargin, ProfitMarginTypeOption, ProviderGlobalConfig, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types"
import { hasDuplicateCouriersFn, updateMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { QUOTE_SOURCES, QuoteCourier, ProviderSource } from "@/shared/types/quotes.types"
import { CourierProfitMarginForm } from "./CourierProfitMarginForm"
import { createUniqueId } from "@/shared/utils/global.utils"

interface ProfitMarginFormProps {
  refetchMarginProfit: () => Promise<void>
  updateSubscreen: (newSubscreen: MarginProfitSubscreens) => void
  data: ProviderGlobalConfig[] | null | undefined
}

export const ProfitMarginForm = ({ refetchMarginProfit, updateSubscreen, data }: ProfitMarginFormProps) => {
  const allProviders = [...QUOTE_SOURCES]
  const [courierError, setCourierError] = useState<string | null>(null)
  const courierFormsData = useRef<CourierForm[]>([])
  const [courierFormsDataLoaded, setCourierFormsDataLoaded] = useState<CourierForm[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ProviderSource | null>('GE')

  const updateProvider = (newProv: ProviderSource) => setSelectedProvider(newProv)
  const addCourierForm = () => {
    if (courierError) setCourierError(null)
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
    setCourierFormsDataLoaded((prev) => [...prev, initialState])
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
    const filteredForms = courierFormsDataLoaded.filter((form) => form.id !== id)
    setCourierFormsDataLoaded(filteredForms)
  }

  useEffect(() => {
    if (!data || data.length === 0) return
    if (data) {
      const couriersFromProvider = data.find((prov) => prov.name === selectedProvider)?.couriers ?? []
      if (couriersFromProvider.length === 0) return
      const couriersToLoad: CourierForm[] = couriersFromProvider.map((courier) => ({
        id: createUniqueId(),
        courier: courier.name,
        value: courier.profitMargin.value,
        profitMarginType: courier.profitMargin.type === 'percentage' ? {
          label: 'Porcentaje',
          value: 'percentage'
        } : {
          label: 'Absoluto',
          value: 'absolute'
        }
      }))
      setCourierFormsDataLoaded(couriersToLoad)
      courierFormsData.current = couriersToLoad
    }
  }, [data, selectedProvider])

  const { isPending, mutate } = useMutation<ProfitMargin, GeneralApiError, UpdateMarginProfitPayload>({
    mutationFn: updateMarginProfitCb,
    onSuccess: async () => {
      await refetchMarginProfit()
      updateSubscreen('view')
    }
  })

  const handleSubmit = () => {
    // Validation errors
    if (courierFormsData.current.length === 0) {
      setCourierError('Debe agregar al menos una paquetería')
      return
    }
    const duplicatedCouriers = hasDuplicateCouriersFn(courierFormsData.current)
    if (duplicatedCouriers.length > 0) {
      const duplicatesStr = duplicatedCouriers.join(', ')
      const msg = `No se permiten paqueterías duplicadas: ${duplicatesStr}`
      if (courierError === msg) return
      setCourierError(`No se permiten paqueterías duplicadas: ${duplicatesStr}`)
      return
    }

    for (const courier of courierFormsData.current) {
      if (!courier.value) {
        const msg = `El valor del margen de ganancia es obligatorio para la paquetería ${courier.courier}`
        if (courierError === msg) return
        setCourierError(msg)
        return
      }

      if (courier.value <= 0) {
        if (courierError) return
        const msg = `El valor del margen de ganancia debe ser mayor a 0 para la paquetería ${courier.courier}`
        if (courierError === msg) return
        setCourierError(msg)
        return
      }
    }

    // Reset errors
    if (courierError) setCourierError(null)

    const formattedProvider: ProviderGlobalConfig = {
      name: selectedProvider as ProviderSource,
      couriers: courierFormsData.current.map((courier) => ({
        name: courier.courier,
        profitMargin: {
          value: courier.value as number,
          type: courier.profitMarginType.value
        }
      }))
    }
    const filteredData: ProviderGlobalConfig[] = data?.filter((prov) => prov.name !== selectedProvider) ?? []
    const payload: UpdateMarginProfitPayload = {
      providers: [...filteredData, formattedProvider]
    }
    mutate(payload)
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

        { courierFormsDataLoaded.length === 0 && (
          <div className="flex flex-col gap-3 justify-center items-center mt-10">
            <span className="text-gray-600 dark:text-gray-400">
              <RiArchiveLine size={40} />
            </span>
            <p className="text-lg text-center">No ha agregado ninguna paquetería</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">De click en &quot;Agregar paquetería&quot; para añadir una nueva configuración.</p>
          </div>
        )}
        { courierFormsDataLoaded.length > 0 && (
          <div className="flex flex-col gap-3 justify-center items-center mt-10">
            { courierFormsDataLoaded.map((form) => (
              <CourierProfitMarginForm
                key={form.id}
                id={form.id}
                courierFormsDataLoaded={form}
                onRemove={removeCourierForm}
                changeCourier={changeSelectedCourier}
                updateProfitMarginType={updateProfitMarginTypeFromCourierForm}
                updateValue={updateValue}
              />
            ))}
          </div>
        ) }
      </Card>

      { courierError && (
        <Card className="max-w-lg mx-auto">
          <div className="flex gap-2 justify-center text-red-500">
            <RiErrorWarningLine />
            <p className="text-center font-semibold text-base">{courierError}</p>
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