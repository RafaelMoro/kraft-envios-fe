"use client"
import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { Button, Spinner } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

import { GeneralApiError } from "@/shared/types/global.types"
import { GetQuoteDataAxios, GetQuoteForm, PackageType, Quote, QuoteFormSchema } from "@/shared/types/quotes.types"
import { getQuoteMutationCb, calculateVolumetricWeight } from "@/shared/utils/quotes.utils"
import { QuoteInput } from "./QuoteInput"
import { TypePackage } from "./TypePackage"
import { DEFAULT_ENVELOPE_HEIGHT, DEFAULT_ENVELOPE_LENGTH, DEFAULT_ENVELOPE_WIDTH } from "@/shared/constants/quotes.constants"
import { PackageDimensions } from "@/shared/types/guides.types"

interface QuoteFormProps {
  updateQuotes: (quotesGotten: Quote[]) => void
  resetSelectedQuotes: () => void
  resetFiltersQuotes: () => void;
  updatePackageDimensions: (dimensions: PackageDimensions) => void
}

export const QuoteForm = ({ updateQuotes, resetSelectedQuotes, resetFiltersQuotes, updatePackageDimensions }: QuoteFormProps) => {
  const [volumetricWeight, setVolumetricWeight] = useState<number | null>(null)

  // State for type of package
  const [typePackage, setTypePackage] = useState<PackageType>('box')
  const updateTypePackage = (type: PackageType) => {
    setTypePackage(type)

    if (type === 'envelope') {
      setDefaultEnvelope()
      return
    }
    clearPackageDimensions()
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
    resetField,
  } = useForm<GetQuoteForm>({
    resolver: yupResolver(QuoteFormSchema)
  })
  const [length, height, width, weight] = watch(['length', 'height', 'width', 'weight'])

  const { mutate: getQuotes, isPending, data } = useMutation<GetQuoteDataAxios, GeneralApiError, GetQuoteForm>({
    mutationFn: getQuoteMutationCb,
  })
  const quotesFetched = data?.data?.data?.data?.quotes

  const onSubmit: SubmitHandler<GetQuoteForm> = (data) => {
    const packageDimensions: PackageDimensions = {
      length: String(data.length),
      height: String(data.height),
      width: String(data.width),
      weight: String(data.weight),
    }
    updatePackageDimensions(packageDimensions)
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

  // Effect to calculate volumetric weight with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (length && height && width) {
        const volumetric = calculateVolumetricWeight(length, height, width)
        setVolumetricWeight(volumetric)
      } else {
        setVolumetricWeight(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [length, height, width])

  const clearInput = (inputName: string) => {
    reset({ [inputName]: '' })
  }

  // Functions to handle package type changes
  const setDefaultEnvelope = () => {
    setValue('length', DEFAULT_ENVELOPE_LENGTH)
    setValue('height', DEFAULT_ENVELOPE_HEIGHT)
    setValue('width', DEFAULT_ENVELOPE_WIDTH)
  }

  const clearPackageDimensions = () => {
    resetField('length')
    resetField('height')
    resetField('width')
  }

  const weightInfoText = (weight && volumetricWeight !== null)
    ? `Peso Masa: ${Number(weight).toFixed(2)} kg | Peso Volumétrico: ${volumetricWeight.toFixed(2)} kg | Peso a cotizar: ${Math.max(Number(weight), volumetricWeight).toFixed(2)} kg`
    : volumetricWeight !== null
      ? `Peso Volumétrico: ${volumetricWeight.toFixed(2)} kg | Peso a cotizar: ${Math.max(Number(weight) || 0, volumetricWeight).toFixed(2)} kg`
      : ''

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
            label="Largo (cm)"
            inputId="length"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.length?.message}
          />
          <QuoteInput
            label="Alto (cm)"
            inputId="height"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.height?.message}
          />
          <QuoteInput
            label="Ancho (cm)"
            inputId="width"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.width?.message}
          />
          <QuoteInput
            label="Peso (kg)"
            inputId="weight"
            inputType="number"
            clearInput={clearInput}
            register={register}
            errorMessage={errors.weight?.message}
          />
          { weightInfoText && (
            <div className="w-full flex items-center justify-center text-sm text-center text-gray-500 mt-2 md:col-span-2">
              <p>
                {weightInfoText}
              </p>
            </div>
          )}
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