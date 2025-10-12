"use client"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { Button, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

import { GeneralApiError } from "@/shared/types/global.types"
import { GetQuoteDataAxios, GetQuoteForm, Quote, QuoteFormSchema } from "@/shared/types/quotes.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { getQuoteMutationCb } from "@/shared/utils/quotes.utils"
import { useEffect } from "react"
import { RiCloseLine } from "@remixicon/react"

interface QuoteFormProps {
  updateQuotes: (quotesGotten: Quote[]) => void
  resetSelectedQuotes: () => void
  resetFiltersQuotes: () => void;
}

export const QuoteForm = ({ updateQuotes, resetSelectedQuotes, resetFiltersQuotes }: QuoteFormProps) => {
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
          <div>
            <div className="mb-2 block">
              <Label htmlFor="originPostalCode">Código Postal de Origen</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                id="originPostalCode"
                type="text"
                inputMode="numeric"
                {...register("originPostalCode")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("originPostalCode")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.originPostalCode?.message && (
              <ErrorMessage>{errors.originPostalCode?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="destinationPostalCode">Código Postal de Destino</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                id="destinationPostalCode"
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                type="text"
                inputMode="numeric"
                {...register("destinationPostalCode")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("destinationPostalCode")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.destinationPostalCode?.message && (
              <ErrorMessage>{errors.destinationPostalCode?.message}</ErrorMessage>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h4 className="text-xl font-semibold">Paquete:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="length">Largo</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                id="length"
                type="number"
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                required
                {...register("length")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("length")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.length?.message && (
              <ErrorMessage>{errors.length?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="height">Alto</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                id="height"
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                type="number"
                required
                {...register("height")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("height")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.height?.message && (
              <ErrorMessage>{errors.height?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="width">Ancho</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                id="width"
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                type="number"
                required
                {...register("width")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("width")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.width?.message && (
              <ErrorMessage>{errors.width?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="weight">Peso</Label>
            </div>
            <div className="grid grid-cols-1 grid-rows-1">
              <TextInput
                id="weight"
                className="col-start-1 col-end-2 row-start-1 row-end-2"
                type="number"
                required
                {...register("weight")}
              />
              <button className="justify-self-end mr-2 col-start-1 col-end-2 row-start-1 row-end-2 z-10" onClick={() => clearInput("weight")}>
                <RiCloseLine />
              </button>
            </div>
            { errors.weight?.message && (
              <ErrorMessage>{errors.weight?.message}</ErrorMessage>
            )}
          </div>
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