"use client"
import { useState } from "react"
import { Button, Card, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { RiAddLine, RiArchiveLine, RiArrowDownSLine } from "@remixicon/react"

import { MarginProfitForm, MarginProfitSchema, ProfitMargin, ProviderGlobalConfig, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types"
import { updateMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { QUOTE_SOURCES, QuoteSource } from "@/shared/types/quotes.types"
import { CourierProfitMarginForm } from "./CourierProfitMarginForm"
import { createUniqueId } from "@/shared/utils/global.utils"

interface ProfitMarginFormProps {
  refetchMarginProfit: () => Promise<void>
  data: ProviderGlobalConfig[] | null | undefined
}

export const ProfitMarginForm = ({ refetchMarginProfit, data }: ProfitMarginFormProps) => {
  const allProviders = [...QUOTE_SOURCES]
  const [courierForms, setCourierForms] = useState<string []>([])
  const [selectedProvider, setSelectedProvider] = useState<QuoteSource | null>('GE')

  const updateProvider = (newProv: QuoteSource) => setSelectedProvider(newProv)
  const addCourierForm = () => {
    const newId = createUniqueId()
    setCourierForms((prev) => [...prev, newId])
  }
  const removeCourierForm = (id: string) => {
    const filteredCouriersForms = courierForms.filter((courierId) => courierId !== id)
    setCourierForms(filteredCouriersForms)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarginProfitForm>({
    resolver: yupResolver(MarginProfitSchema)
  })

  const { mutate, isPending } = useMutation<ProfitMargin, GeneralApiError, UpdateMarginProfitPayload>({
    mutationFn: updateMarginProfitCb,
    onSuccess: async () => {
      await refetchMarginProfit()
    }
  })

  const onSubmit: SubmitHandler<MarginProfitForm> = (data) => {
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
      onSubmit={handleSubmit(onSubmit)}
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
            { courierForms.map((id, key) => (
              <CourierProfitMarginForm key={key} id={id} onRemove={removeCourierForm} />
            )) }
          </div>
        ) }
      </Card>

      <div className="flex justify-center">
        <Button
          className="hover:cursor-pointer"
          disabled={isPending}
          type="submit">
          { isPending ? (<Spinner aria-label="loading updating margin profit" />) : 'Guardar configuración' }
        </Button>
      </div>
    </form>
  )
}