import { Button, Label, TextInput } from "flowbite-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { SubmitHandler, useForm } from "react-hook-form"
import { ParcelInfoFormValuesFormtoneSchema, ParcelInfoFormValuesTone } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface CreateGuideFormValuesTone {
  isMobileTablet: boolean
  goNext: () => void
  goPrev: () => void
}

export const ParcelInfoFormTone = ({ isMobileTablet, goNext, goPrev }: CreateGuideFormValuesTone) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParcelInfoFormValuesTone>({
    resolver: yupResolver(ParcelInfoFormValuesFormtoneSchema)
  })

  const onSubmit: SubmitHandler<ParcelInfoFormValuesTone> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    // updateParcelInfo(data)
    goNext()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      { isMobileTablet && (<h5 className="text-xl font-bold text-center mb-5">Información del paquete</h5>)}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="content">Contenido del paquete</Label>
        </div>
        <TextInput
          data-testid="content"
          // defaultValue={parcelInfo.content}
          id="content"
          type="text"
          {...register("content")}
        />
        { errors?.content?.message && (
          <ErrorMessage>{errors.content?.message}</ErrorMessage>
        )}
      </div>
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