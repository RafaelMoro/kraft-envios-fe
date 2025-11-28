import { useState } from "react"
import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import {
  CreateGuideAddressFormSchemaPkk,
  CreateGuideAddressFormValuesPkk,
  CreateGuideAddressValuesPkk,
} from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface CreateGuideAddressFormPkkProps {
  isDestination?: boolean
  addressData: CreateGuideAddressValuesPkk;
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateOriginAddress: (data: CreateGuideAddressValuesPkk) => void
}

export const CreateGuideAddressFormPkk = ({
  isDestination, addressData, goNext, goPrev, toggleModal, updateOriginAddress,
}: CreateGuideAddressFormPkkProps) => {
  const [isResidential, setIsResidential] = useState(addressData.isResidential);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGuideAddressFormValuesPkk>({
    resolver: yupResolver(CreateGuideAddressFormSchemaPkk)
  })

  const onSubmit: SubmitHandler<CreateGuideAddressFormValuesPkk> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    const updatedData: CreateGuideAddressValuesPkk = { ...data, isResidential }
    updateOriginAddress(updatedData)
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
      <h4 className="text-xl">Datos personales</h4>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Nombre</Label>
          </div>
          <TextInput
            data-testid="name"
            defaultValue={addressData.name}
            id="name"
            type="text"
            {...register("name")}
          />
          { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Correo electrónico (Opcional)</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            defaultValue={addressData.email ?? ''}
            {...register("email")}
          />
          { errors?.email?.message && (
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="phone">Teléfono</Label>
          </div>
          <TextInput
            data-testid="phone"
            id="phone"
            type="text"
            inputMode="numeric"
            defaultValue={addressData.phone}
            {...register("phone")}
          />
          { errors?.phone?.message && (
            <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
          )}
        </div>
      </section>
      <div className="mt-8 flex flex-col gap-5">
        <h4 className="text-xl">Domicilio</h4>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <Label htmlFor="town">Ciudad</Label>
            </div>
            <TextInput
              data-testid="city"
              defaultValue={addressData.city}
              id="city"
              type="text"
              {...register("city")}
            />
            { errors?.city?.message && (
              <ErrorMessage>{errors.city?.message}</ErrorMessage>
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
              <Label htmlFor="zipcode">Código Postal</Label>
            </div>
            <TextInput
              id="zipcode"
              type="text"
              inputMode="numeric"
              {...register("zipcode")}
            />
            { errors?.zipcode?.message && (
              <ErrorMessage>{errors.zipcode?.message}</ErrorMessage>
            )}
          </div>
          <div className="justify-self-start self-center">
            <ToggleSwitch checked={isResidential} label="Es residencial" onChange={setIsResidential} />
          </div>
        </section>
      </div>
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