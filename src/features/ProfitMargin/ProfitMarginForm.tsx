"use client"
import { useState } from "react"
import { Button, Dropdown, DropdownItem, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { MarginProfitForm, MarginProfitSchema } from "@/shared/types/margin-profit.types"
import { yupResolver } from "@hookform/resolvers/yup"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

export const ProfitMarginForm = () => {
  const [profitMarginType, setProfitMarginType] = useState<'percentage' | 'absolute'>('percentage')
  const updateProfitMarginType = (value: 'percentage' | 'absolute') => {
    setProfitMarginType(value)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarginProfitForm>({
    resolver: yupResolver(MarginProfitSchema)
  })

  const onSubmit: SubmitHandler<MarginProfitForm> = (data) => {
    console.log(data)
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
          <Dropdown label={`Tipo: ${profitMarginType}`} inline dismissOnClick={false}>
            <DropdownItem onClick={() => updateProfitMarginType('percentage')}>Porcentaje</DropdownItem>
            <DropdownItem onClick={() => updateProfitMarginType('absolute')}>Absoluto</DropdownItem>
          </Dropdown>
      </section>

      <div className="flex justify-center">
        <Button
          className="hover:cursor-pointer"
          // disabled={isPending}
          type="submit">
          {/* { isPending ? (<Spinner aria-label="loading get quotes kraft envios" />) : 'Cotizar' } */}
          Actualizar margen
        </Button>
      </div>
    </form>
  )
}