"use client"
import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

import { MarginProfitForm, MarginProfitSchema, ProfitMargin, ProfitMarginTypeOption, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { updateMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { GeneralApiError } from "@/shared/types/global.types"

export const ProfitMarginForm = () => {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarginProfitForm>({
    resolver: yupResolver(MarginProfitSchema)
  })

  const { mutate, isPending } = useMutation<ProfitMargin, GeneralApiError, UpdateMarginProfitPayload>({
    mutationFn: updateMarginProfitCb,
  })

  const onSubmit: SubmitHandler<MarginProfitForm> = (data) => {
    const payload: UpdateMarginProfitPayload = {
      profitMargin: {
        value: data.value,
        type: profitMarginType.value
      }
    }
    mutate(payload)
  }

  return (
     <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center gap-16"
    >
      <section className="flex flex-col gap-5">
        <h4 className="text-xl font-semibold mb-4">Actualizar margen de ganancia</h4>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="value">Valor</Label>
            </div>
            <TextInput
              id="value"
              type="number"
              inputMode="numeric"
              defaultValue={0}
              {...register("value")}
            />
            { errors.value?.message && (
              <ErrorMessage>{errors.value?.message}</ErrorMessage>
            )}
          </div>
          <Dropdown label={`Tipo: ${profitMarginType.label}`} inline>
            <DropdownItem onClick={() => updateProfitMarginType('percentage')}>Porcentaje</DropdownItem>
            <DropdownItem onClick={() => updateProfitMarginType('absolute')}>Absoluto</DropdownItem>
          </Dropdown>
      </section>

      <div className="flex justify-center">
        <Button
          className="hover:cursor-pointer"
          disabled={isPending}
          type="submit">
          { isPending ? (<Spinner aria-label="loading updating margin profit" />) : 'Actualizar margen' }
        </Button>
      </div>
    </form>
  )
}