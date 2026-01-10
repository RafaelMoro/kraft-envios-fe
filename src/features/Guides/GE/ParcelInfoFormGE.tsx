import { ReactNode } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { ParcelInfoFormValuesSchema, ParcelInfoValues, ParcelInfoValuesGE, SearchProduct } from "@/shared/types/guides.types";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";

interface ParcelInfoFormGEProps {
  children: ReactNode;
  isMobileTablet: boolean;
  parcelInfo: ParcelInfoValuesGE;
  searchProductSat: string;
  selectedProduct: SearchProduct | null;
  goPrev: () => void;
  goNext: () => void;
  updateParcelInfo: (data: ParcelInfoValuesGE) => void;
  updateErrorProductSat: (message: string) => void;
}

export const ParcelInfoFormGE = ({
  isMobileTablet,
  searchProductSat,
  selectedProduct,
  parcelInfo,
  children,
  goNext,
  goPrev,
  updateErrorProductSat,
  updateParcelInfo,
}: ParcelInfoFormGEProps) => {
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

    if (!searchProductSat) {
      updateErrorProductSat('Debes de buscar un producto para categorizarlo')
      return;
    }
    if (!selectedProduct) {
      updateErrorProductSat('Debes de seleccionar un producto válido de la lista')
      return;
    }

    const newData: ParcelInfoValuesGE = {
      content: data.content,
      satProductId: selectedProduct.code,
      length: '',
      width: '',
      height: '',
      weight: ''
    }
    updateParcelInfo(newData)
    goNext()
  }

  return (
    <form
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
            defaultValue={parcelInfo.content}
            id="content"
            type="text"
            {...register("content")}
          />
          { errors?.content?.message && (
            <ErrorMessage>{errors.content?.message}</ErrorMessage>
          )}
        </div>
      </section>
      <div className="flex justify-between mt-7">
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