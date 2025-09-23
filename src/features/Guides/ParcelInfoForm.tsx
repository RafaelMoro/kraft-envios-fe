"use client"
import { ReactNode } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button, Label, TextInput } from "flowbite-react"

import { ParcelInfoFormValues, ParcelInfoFormValuesFormSchema } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface ParcelInfoFormProps {
  parcelInfo: ParcelInfoFormValues
  searchProductSat: string
  children: ReactNode
  goNext: () => void
  goPrev: () => void
  updateParcelInfo: (data: ParcelInfoFormValues) => void
  updateErrorProductSat: (message: string) => void
}

export const ParcelInfoForm = ({ children, searchProductSat, parcelInfo, goNext, goPrev, updateParcelInfo, updateErrorProductSat }: ParcelInfoFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParcelInfoFormValues>({
    resolver: yupResolver(ParcelInfoFormValuesFormSchema)
  })

  const onSubmit: SubmitHandler<ParcelInfoFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    if (!searchProductSat) {
      // show error
      updateErrorProductSat('Debes de buscar un producto para categorizarlo')
      return;
    }
    updateParcelInfo(data)
    goNext()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-4">
        { children }
        <div>
          <div className="mb-2 block">
            <Label htmlFor="content">Contenido del paquete</Label>
          </div>
          <TextInput
            data-testid="content"
            defaultValue={parcelInfo.content}
            id="content"
            type="text"
            {...register("content")}
          />
          { errors?.content?.message && (
            <ErrorMessage>{errors.content?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="value">Valor del paquete</Label>
          </div>
          <TextInput
            data-testid="value"
            defaultValue={parcelInfo.value}
            id="value"
            type="number"
            {...register("value")}
          />
          { errors?.value?.message && (
            <ErrorMessage>{errors.value?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="quantity">Cantidad</Label>
          </div>
          <TextInput
            data-testid="quantity"
            defaultValue={parcelInfo.quantity}
            id="quantity"
            type="number"
            {...register("quantity")}
          />
          { errors?.quantity?.message && (
            <ErrorMessage>{errors.quantity?.message}</ErrorMessage>
          )}
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button
          color="light"
          data-testid="parcel-info-form-cancel-button"
          className="hover:cursor-pointer"
          onClick={goPrev}
        >
          Regresar
        </Button>
        <Button data-testid="parcel-info-form-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}