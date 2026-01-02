"use client"
import { Button, Checkbox, CheckIcon, Label, Spinner, TextInput, ToggleSwitch } from "flowbite-react"
import { FieldErrors, SubmitHandler, UseFormHandleSubmit, UseFormRegister, UseFormSetError } from "react-hook-form";

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { AddTag } from "@/shared/ui/organisms/AddTag"
import { CreateAddressFormValues, CreateAddressPayload, ManageAddressFormScreen } from "@/shared/types/addresses.types";
import { useAddTag } from "@/shared/hooks/useAddTag";
import { useState } from "react";
import { formatPayloadCreateAddress } from "@/shared/utils/addresses.utils";

interface CreateAddressSubformProps {
  formData: CreateAddressPayload;
  isEdit: boolean;
  actionText: "Editar" | "Crear"
  errors: FieldErrors<CreateAddressFormValues>
  register: UseFormRegister<CreateAddressFormValues>
  handleSubmit: UseFormHandleSubmit<CreateAddressFormValues, CreateAddressFormValues>
  setError: UseFormSetError<CreateAddressFormValues>
  createAddressMutation: (payload: CreateAddressPayload) => void;
  editAddressMutation: (payload: CreateAddressPayload) => void;
  isPending: boolean;
  isSuccess: boolean;
  isPendingEdit: boolean;
  isSuccessEdit: boolean;
  toggleModal: () => void;
  setSubscreen: (subscreen: ManageAddressFormScreen) => void
}

export const CreateAddressSubform = ({
  formData,
  isEdit,
  actionText,
  errors,
  createAddressMutation,
  editAddressMutation,
  register,
  handleSubmit,
  setError,
  isPending,
  isSuccess,
  isPendingEdit,
  isSuccessEdit,
  toggleModal,
  setSubscreen,
}: CreateAddressSubformProps) => {
  // Create address in GE states
  const [shouldCreateGEAddress, setShouldCreateGEAddress] = useState(false);
  const [consentSkipGECreation , setConsentSkipGECreation] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  const handleShouldCreateGEAddress = () => {
    setShouldCreateGEAddress((prev) => {
      if (!prev) {
        setConsentSkipGECreation(false);
      }
      return !prev
    });
  }

  const handleConsentSkipGECreation = (isChecked: boolean) => {
    setConsentSkipGECreation(isChecked);
    if (showConsentError) setShowConsentError(false);
  }

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

  const submitButtonText = shouldCreateGEAddress ? 'Siguiente' : `${actionText} dirección`;

  const onSubmit: SubmitHandler<CreateAddressFormValues> = (data, event) => {
      event?.preventDefault()
      if (showConsentError) setShowConsentError(false)
  
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
  
      if (!shouldCreateGEAddress && !consentSkipGECreation) {
        setShowConsentError(true)
        return
      }
  
      if (shouldCreateGEAddress && !consentSkipGECreation) {
        setSubscreen('ADD_GE_INFORMATION')
        return
      }
  
      // TODO: Check if this will be executed before next screen of creating GE address
      createAddressMutation(formattedPayload)
    }

  return (
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
      <ToggleSwitch checked={shouldCreateGEAddress} label="Crear dirección en GE" onChange={handleShouldCreateGEAddress} />
      { !shouldCreateGEAddress && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="remember"
              checked={consentSkipGECreation}
              onChange={(e) => handleConsentSkipGECreation(e.target.checked)}
            />
            <Label htmlFor="remember">Entiendo y acepto omitir en no crear esta dirección en GE</Label>
          </div>
          { showConsentError && (
            <div className="lg:col-start-2 lg:col-end-3 w-full flex justify-center">
              <ErrorMessage>Marque esta opcion para continuar.</ErrorMessage>
            </div>
          )}
        </>
      )}
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
          { !isSuccess && !isSuccessEdit && !isPending && !isPendingEdit && submitButtonText }
        </Button>
      </div>
    </form>
  )
}