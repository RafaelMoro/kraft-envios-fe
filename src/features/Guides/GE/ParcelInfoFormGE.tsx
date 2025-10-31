import { ReactNode } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { ParcelInfoFormValuesSchema, ParcelInfoValues } from "@/shared/types/guides.types";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";

interface ParcelInfoFormGEProps {
  isMobileTablet: boolean;
  children: ReactNode;
  goPrev: () => void;
  goNext: () => void;
}

export const ParcelInfoFormGE = ({ isMobileTablet, children, goNext, goPrev }: ParcelInfoFormGEProps) => {
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

    // TODO: update data
    goNext()
  }

  return (
    <form
      className="p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      { isMobileTablet && (<h5 className="text-xl font-bold text-center mb-5">Información del paquete</h5>)}
      <section className="flex flex-col gap-4">
        { children }
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