"use client"
import { Button, CheckIcon, Label, Modal, ModalBody, ModalHeader, Spinner, TextInput, ToggleSwitch } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { AddressAliasResponse, CreateAddressFormSchema, CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse } from "@/shared/types/addresses.types";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { createAddressCb, editAddressCb, formatPayloadCreateAddress } from "@/shared/utils/addresses.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { AddTag } from "@/shared/ui/organisms/AddTag";
import { useAddTag } from "@/shared/hooks/useAddTag";
import { useState } from "react";

interface CreateAddressProps {
  open: boolean;
  formData: CreateAddressPayload;
  isEdit: boolean;
  toggleModal: () => void;
  toggleNotification: () => void;
  updateNotificationMessage: (message: string) => void;
  refetchAddresses: () => Promise<void>;
}

export const ManageAddressForm = ({
  open, formData, isEdit, toggleModal, toggleNotification, updateNotificationMessage, refetchAddresses
}: CreateAddressProps) => {
  const [shouldCreateGEAddress, setShouldCreateGEAddress] = useState(false);

  const {
    tags: towns,
    addTag: addTown,
    removeTag: removeTown,
    validateTagsEmpty: validateTownsEmpty,
    error: townsError,
    setError: setTownsError
  } = useAddTag({ tagsInitState: (formData?.town ?? []) })
  const {
    tags: cities,
    addTag: addCity,
    removeTag: removeCity,
    validateTagsEmpty: validateCitiesEmpty,
    error: citiesError,
    setError: setCitiesError
  } = useAddTag({ tagsInitState: (formData?.city ?? []) })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<CreateAddressFormValues>({
    resolver: yupResolver(CreateAddressFormSchema)
  })
  const actionText = isEdit ? 'Editar' : 'Crear'

  const onSuccess = async () => {
    await refetchAddresses()
    setTimeout(() => {
      reset()
      toggleModal()
    }, 1000)
  }

  const onError = () => {
    updateNotificationMessage(`Ocurrió un error al ${actionText} la dirección. Por favor, intenta de nuevo.`)
    toggleNotification()
    reset()
    toggleModal()
  }

  const {
    mutate: createAddressMutation, isPending, isSuccess
  } = useMutation<CreateAddressResponse, GeneralApiError, CreateAddressPayload>({
    mutationFn: createAddressCb,
    onSuccess: async () => {
      await onSuccess()
    },
    onError: () => {
      onError()
    }
  })

  const {
    mutate: editAddressMutation, isPending: isPendingEdit, isSuccess: isSuccessEdit,
  } = useMutation<AddressAliasResponse, GeneralApiError, CreateAddressPayload>({
    mutationFn: editAddressCb,
    onSuccess: async () => {
      await onSuccess()
    },
    onError: () => {
      onError()
    }
  })

  const onSubmit: SubmitHandler<CreateAddressFormValues> = (data, event) => {
    event?.preventDefault()

    // Check if alias has been modified in edit mode
    if (isEdit && formData?.alias && data?.alias !== formData.alias) {
      setError('alias', {
        type: 'manual',
        message: 'El alias no puede ser editado'
      })
      return
    }

    const townsEmpty = validateTownsEmpty()
    const citiesEmpty = validateCitiesEmpty()
    if (townsEmpty || citiesEmpty) {
      if (townsEmpty) setTownsError('Debe agregar al menos un municipio')
      if (citiesEmpty) setCitiesError('Debe agregar al menos una ciudad')
      return
    }

    const formattedPayload = formatPayloadCreateAddress({payload: data, cities, towns})
    if (isEdit) {
      editAddressMutation(formattedPayload)
      return
    }

    createAddressMutation(formattedPayload)
  }

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>{actionText} dirección</ModalHeader>
      <ModalBody>
        <form
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <div className="mb-2 block">
              <Label htmlFor="street1">Calle</Label>
            </div>
            <TextInput
              data-testid="street1"
              defaultValue={formData.addressName}
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
              <Label htmlFor="externalNumber">Numero exterior</Label>
            </div>
            <TextInput
              data-testid="externalNumber"
              id="externalNumber"
              type="text"
              defaultValue={formData.externalNumber}
              inputMode="numeric"
              {...register("externalNumber")}
            />
            { errors?.externalNumber?.message && (
              <ErrorMessage>{errors.externalNumber?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="internalNumber">Numero interior (Opcional)</Label>
            </div>
            <TextInput
              data-testid="internalNumber"
              defaultValue={formData.internalNumber as string}
              id="internalNumber"
              type="text"
              inputMode="numeric"
              {...register("internalNumber")}
            />
            { errors?.internalNumber?.message && (
              <ErrorMessage>{errors.internalNumber?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="neighborhood">Colonia</Label>
            </div>
            <TextInput
              data-testid="neighborhood"
              id="neighborhood"
              defaultValue={formData.neighborhood}
              type="text"
              {...register("neighborhood")}
            />
            { errors?.neighborhood?.message && (
              <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
            )}
          </div>
          <AddTag
            label="cities"
            text="Ciudades"
            tags={cities}
            addTag={addCity}
            removeTag={removeCity}
            placeholder="Presiona enter para agregar ciudades"
            errorMessage={citiesError}
            setError={setCitiesError}
          />
          <AddTag
            label="towns"
            text="Municipios"
            tags={towns}
            addTag={addTown}
            removeTag={removeTown}
            placeholder="Presiona enter para agregar municipios"
            errorMessage={townsError}
            setError={setTownsError}
          />
          <div>
            <div className="mb-2 block">
              <Label htmlFor="state">Estado de la República</Label>
            </div>
            <TextInput
              data-testid="state"
              id="state"
              defaultValue={formData.state}
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
              data-testid="zipcode"
              defaultValue={formData.zipcode}
              id="zipcode"
              type="text"
              inputMode="numeric"
              {...register("zipcode")}
            />
            { errors?.zipcode?.message && (
              <ErrorMessage>{errors.zipcode?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference">Referencia</Label>
            </div>
            <TextInput
              data-testid="reference"
              defaultValue={formData.reference as string}
              id="reference"
              type="text"
              {...register("reference")}
            />
            { errors?.reference?.message && (
              <ErrorMessage>{errors.reference?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="alias">Alias</Label>
            </div>
            <TextInput
              data-testid="alias"
              defaultValue={formData.alias}
              id="alias"
              type="text"
              {...register("alias")}
            />
            { errors?.alias?.message && (
              <ErrorMessage>{errors.alias?.message}</ErrorMessage>
            )}
          </div>
          <ToggleSwitch checked={shouldCreateGEAddress} label="Crear dirección en GE" onChange={setShouldCreateGEAddress} />
          <div className="lg:col-span-2 flex justify-between mt-4">
            <Button
              color="red"
              outline
              data-testid="origin-address-cancel-button"
              className="hover:cursor-pointer"
              disabled={isPending || isSuccess || isPendingEdit || isSuccessEdit}
              onClick={toggleModal}
            >
              Cancelar
            </Button>
            <Button
              data-testid="origin-address-next-button"
              type="submit"
              className="hover:cursor-pointer"
              disabled={isPending || isSuccess || isPendingEdit || isSuccessEdit}
            >
              { (isSuccess || isSuccessEdit) && (<CheckIcon />)}
              { (isPending || isPendingEdit) && (<Spinner aria-label={`loading ${actionText} kraft envios`} />) }
              { !isSuccess && !isSuccessEdit && !isPending && !isPendingEdit && `${actionText} dirección`}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}