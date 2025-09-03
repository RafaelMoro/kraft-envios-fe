"use client"
import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

import { MarginProfitForm, MarginProfitSchema, ProfitMargin, ProfitMarginTypeOption, ProviderGlobalConfig, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { updateMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { QUOTE_COURIERS, QUOTE_SOURCES, QuoteCourier, QuoteSource } from "@/shared/types/quotes.types"
import { RiAddLine } from "@remixicon/react"

interface ProfitMarginFormProps {
  refetchMarginProfit: () => Promise<void>
  data: ProviderGlobalConfig[] | null | undefined
}

export const ProfitMarginForm = ({ refetchMarginProfit, data }: ProfitMarginFormProps) => {
  const allProviders = [...QUOTE_SOURCES]
  const [selectedProvider, setSelectedProvider] = useState<QuoteSource | null>('GE')
  const updateProvider = (newProv: QuoteSource) => setSelectedProvider(newProv)

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
      <section className="flex flex-col gap-3">
        <h4 className="text-xl font-semibold mb-4 text-center">Configuración por proveedor</h4>
        <p className="text-center text-gray-600 dark:text-gray-400">Configure los margenes de ganancia por paquetería y por proveedor</p>
        <div className="flex gap-3 items-center justify-center">
          <div className="mb-2 block">
            <Label htmlFor="provider-value" className="text-lg">Proveedor:</Label>
          </div>
          <Dropdown label={selectedProvider} inline>
            {allProviders.map((provider) => (
              <DropdownItem key={provider} onClick={() => updateProvider(provider)}>
                {provider}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
        <article className="flex flex-col md:flex-row justify-between mt-10">
          <h5 className="text-lg font-semibold mb-4 text-center">Configuración de la paquetería</h5>
          <Button
            className="hover:cursor-pointer inline-flex gap-1"
            color="light"
          >
            <RiAddLine />
            Agregar paquetería
          </Button>
        </article>
      </section>

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