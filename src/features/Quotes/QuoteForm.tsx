"use client"
import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { Button, Spinner } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

import { GeneralApiError } from "@/shared/types/global.types"
import { GetQuoteDataAxios, GetQuoteForm, PackageType, Quote, QuoteFormSchema } from "@/shared/types/quotes.types"
import { getQuoteMutationCb } from "@/shared/utils/quotes.utils"
import { QuoteInput } from "./QuoteInput"
import { TypePackage } from "./TypePackage"

interface QuoteFormProps {
  updateQuotes: (quotesGotten: Quote[]) => void
  resetSelectedQuotes: () => void
  resetFiltersQuotes: () => void;
}

export const QuoteForm = ({ updateQuotes, resetSelectedQuotes, resetFiltersQuotes }: QuoteFormProps) => {
  const [typePackage, setTypePackage] = useState<PackageType>('box')
  const updateTypePackage = (type: PackageType) => {
    setTypePackage(type)
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GetQuoteForm>({
    resolver: yupResolver(QuoteFormSchema)
  })

  const { mutate: getQuotes, isPending, data } = useMutation<GetQuoteDataAxios, GeneralApiError, GetQuoteForm>({
    mutationFn: getQuoteMutationCb,
  })
  const quotesFetched = data?.data?.data?.data?.quotes

  const onSubmit: SubmitHandler<GetQuoteForm> = (data) => {
    getQuotes(data)
  }

  const clearQuotes = () => {
    reset()
    resetSelectedQuotes()
    resetFiltersQuotes()
    updateQuotes([])
  }

  useEffect(() => {
    if (quotesFetched) {
      updateQuotes(quotesFetched)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotesFetched])

  const clearInput = (inputName: string) => {
    reset({ [inputName]: '' })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center gap-16"
    >
      <section className="flex flex-col gap-5">
        <h4 className="text-xl font-semibold mb-4">Domicilio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuoteInput
            label="Código Postal de Origen"
            inputId="originPostalCode"
            inputType="text"
            isNumericInput
            clearInput={clearInput}
            register={register}
            errorMessage={errors.originPostalCode?.message}
          />
          <QuoteInput
            label="Código Postal de Destino"
            inputId="destinationPostalCode"
            inputType="text"
            isNumericInput
            clearInput={clearInput}
            register={register}
            errorMessage={errors.destinationPostalCode?.message}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h4 className="text-xl font-semibold">Paquete:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TypePackage
            typePackage={typePackage}
            updateTypePackage={updateTypePackage}
          />
          <QuoteInput
            label="Largo"
            inputId="length"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.length?.message}
          />
          <QuoteInput
            label="Alto"
            inputId="height"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.height?.message}
          />
          <QuoteInput
            label="Ancho"
            inputId="width"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.width?.message}
          />
          <QuoteInput
            label="Peso"
            inputId="weight"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.weight?.message}
          />
        </div>
      </section>
      <div className="flex justify-center gap-6">
        <Button
          color="light"
          className="hover:cursor-pointer"
          disabled={isPending}
          onClick={clearQuotes}
          >
          Crear nueva cotización
        </Button>
        <Button
          className="hover:cursor-pointer"
          disabled={isPending}
          type="submit">
          { isPending ? (<Spinner aria-label="loading get quotes kraft envios" />) : 'Cotizar' }
        </Button>
      </div>
    </form>
  )
}