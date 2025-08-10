"use client"

import { GetQuoteForm, QuoteFormSchema } from "@/shared/types/quotes.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

export const QuoteForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GetQuoteForm>({
    resolver: yupResolver(QuoteFormSchema)
  })

  const onSubmit: SubmitHandler<GetQuoteForm> = (data) => {
    console.log('data', data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-3 grid-rows-2 gap-4"
    >
      <div>
        <div className="mb-2 block">
          <Label htmlFor="originPostalCode">Código Postal de Origen</Label>
        </div>
        <TextInput
          id="originPostalCode"
          type="text"
          inputMode="numeric"
          {...register("originPostalCode")}
        />
        { errors.originPostalCode?.message && (
          <ErrorMessage>{errors.originPostalCode?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="destinationPostalCode">Código Postal de Destino</Label>
        </div>
        <TextInput
          id="destinationPostalCode"
          type="text"
          inputMode="numeric"
          {...register("destinationPostalCode")}
        />
        { errors.destinationPostalCode?.message && (
          <ErrorMessage>{errors.destinationPostalCode?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="weight">Peso</Label>
        </div>
        <TextInput
          id="weight"
          type="number"
          required
          {...register("weight")}
        />
        { errors.weight?.message && (
          <ErrorMessage>{errors.weight?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="length">Largo</Label>
        </div>
        <TextInput
          id="length"
          type="number"
          required
          {...register("length")}
        />
        { errors.length?.message && (
          <ErrorMessage>{errors.length?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="height">Altura</Label>
        </div>
        <TextInput
          id="height"
          type="number"
          required
          {...register("height")}
        />
        { errors.height?.message && (
          <ErrorMessage>{errors.height?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="width">Ancho</Label>
        </div>
        <TextInput
          id="width"
          type="number"
          required
          {...register("width")}
        />
        { errors.width?.message && (
          <ErrorMessage>{errors.width?.message}</ErrorMessage>
        )}
      </div>
      <Button
        className="hover:cursor-pointer"
        // disabled={isPending || isSuccess}
        type="submit">
          Cotizar
        {/* { (isIdle || isError) && 'Iniciar sesión'}
        { isPending && (<Spinner aria-label="loading login kraft envios" />) }
        { isSuccess && (<CheckIcon />)} */}
      </Button>
    </form>
  )
}