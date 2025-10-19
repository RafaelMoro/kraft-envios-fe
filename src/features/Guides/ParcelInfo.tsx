import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { SubmitHandler, useForm } from "react-hook-form"
import { ParcelInfoFormValuesSchema, ParcelInfoValues, ParcelInfoValuesTone } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { useState } from "react"

interface BaseParcelInfo {
  content: string;
}

interface CreateGuideFormValuesTone<T extends BaseParcelInfo = ParcelInfoValuesTone> {
  isMobileTablet: boolean
  parcelInfo: ParcelInfoValues
  goNext: () => void
  goPrev: () => void
  updateParcelInfo: (data: T) => void
}

export const ParcelInfoFormTone = ({ isMobileTablet, parcelInfo, goNext, goPrev, updateParcelInfo }: CreateGuideFormValuesTone<ParcelInfoValuesTone>) => {
  const [notifyMe, setNotifyMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParcelInfoValues>({
    resolver: yupResolver(ParcelInfoFormValuesSchema)
  })

  const onSubmit: SubmitHandler<ParcelInfoValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    const updatedData: ParcelInfoValuesTone = { ...data, notifyMe }
    updateParcelInfo(updatedData)
    goNext()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      { isMobileTablet && (<h5 className="text-xl font-bold text-center mb-5">Información del paquete</h5>)}
      <section className="flex flex-col gap-4">
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
        <ToggleSwitch checked={notifyMe} label="Notificame" onChange={setNotifyMe} />
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