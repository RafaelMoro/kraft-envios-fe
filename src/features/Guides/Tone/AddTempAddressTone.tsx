import { CreateGuideAddressFormSchemaTone, CreateGuideAddressFormValuesTone } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { PersonalDataTone } from "./PersonalDataTone"

interface AddTempAddressToneProps {
  isDestination?: boolean
  addressData: CreateGuideAddressFormValuesTone
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
}

export const AddTempAddressTone = ({
  isDestination, addressData, goNext, goPrev, toggleModal, updateAddress,
}: AddTempAddressToneProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGuideAddressFormValuesTone>({
    resolver: yupResolver(CreateGuideAddressFormSchemaTone)
  })

  const onSubmit: SubmitHandler<CreateGuideAddressFormValuesTone> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    updateAddress(data)
    goNext()
  }

  const handleCancel = () => {
    if (isDestination) {
      goPrev()
      return;
    }

    toggleModal()
  }

  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"
  const cancelColorButton = isDestination ? "light" : "red"

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <PersonalDataTone<CreateGuideAddressFormValuesTone>
        addressData={addressData}
        errors={errors}
        register={register}
      />
      <section className="mt-8 flex flex-col gap-5">
        <h4 className="text-xl">Domicilio</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="street1">Calle</Label>
            </div>
            <TextInput
              data-testid="street1"
              defaultValue={addressData.street1}
              id="street1"
              type="text"
              {...register("street1")}
            />
            { errors?.street1?.message && (
              <ErrorMessage>{errors.street1?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="external_number">Numero exterior</Label>
            </div>
            <TextInput
              data-testid="external_number"
              defaultValue={addressData.external_number}
              id="external_number"
              type="text"
              inputMode="numeric"
              {...register("external_number")}
            />
            { errors?.external_number?.message && (
              <ErrorMessage>{errors.external_number?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="neighborhood">Colonia</Label>
            </div>
            <TextInput
              data-testid="neighborhood"
              defaultValue={addressData.neighborhood}
              id="neighborhood"
              type="text"
              {...register("neighborhood")}
            />
            { errors?.neighborhood?.message && (
              <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="town">Municipio</Label>
            </div>
            <TextInput
              data-testid="town"
              defaultValue={addressData.town}
              id="town"
              type="text"
              {...register("town")}
            />
            { errors?.town?.message && (
              <ErrorMessage>{errors.town?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="state">Estado de la República</Label>
            </div>
            <TextInput
              data-testid="state"
              defaultValue={addressData.state}
              id="state"
              type="text"
              {...register("state")}
            />
            { errors?.state?.message && (
              <ErrorMessage>{errors.state?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference">Referencia del domicilio (Opcional)</Label>
            </div>
            <TextInput
              data-testid="reference"
              defaultValue={addressData.reference ?? ''}
              id="reference"
              type="text"
              {...register("reference")}
            />
            { errors?.reference?.message && (
              <ErrorMessage>{errors.reference?.message}</ErrorMessage>
            )}
          </div>
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button
          {...(!isDestination && { outline: true })}
          color={cancelColorButton}
          data-testid="origin-address-cancel-button"
          className="hover:cursor-pointer"
          onClick={handleCancel}
        >
          {cancelButtonText}
        </Button>
        <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}