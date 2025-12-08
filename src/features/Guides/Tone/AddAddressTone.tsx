import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "flowbite-react"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import { PersonalDataTone } from "./PersonalDataTone"
import {
  AddAddressToneFormSchema, CreateGuidePersonalDataToneFormValues, CreateGuideAddressFormValuesTone, CreateGuideAddressDataToneFormValues,
  AliasSavedTone
} from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address } from "@/shared/types/addresses.types"
import { AddTempAddressTone } from "./AddTempAddressTone"
import { useSelectAlias } from "@/shared/hooks/useAlias"

interface AddAddressToneProps {
  addressData: CreateGuideAddressFormValuesTone
  aliasSaved: AliasSavedTone;
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
  updateSavedAlias: ({ alias, address }: { alias: string; address: CreateGuideAddressDataToneFormValues }) => void
}

export const AddAddressTone = ({
  addressData, aliasSaved, updateAddress, isDestination, goNext, goPrev, toggleModal, updateSavedAlias
}: AddAddressToneProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);
  const {
    aliasSelected, setAliasSelected, addressError, setAddressError,
  } = useSelectAlias({ aliasSaved: aliasSaved.alias });

  const cancelColorButton = isDestination ? "light" : "red"
  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"
  const handleCancel = () => {
    if (isDestination) {
      goPrev()
      return
    }

    toggleModal()
  }

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<CreateGuidePersonalDataToneFormValues>({
    resolver: yupResolver(AddAddressToneFormSchema)
  })

  const onSubmit: SubmitHandler<CreateGuidePersonalDataToneFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!aliasSelected) {
      setAddressError("Por favor selecciona un alias de dirección");
      return;
    }
    if (!aliasSaved.address) {
      setAddressError("La dirección seleccionada no es válida");
      console.warn("Address selected is null");
      return;
    }

    const allData: CreateGuideAddressFormValuesTone = {
      ...data,
      ...aliasSaved.address
    }
    updateAddress(allData)
    goNext()
  }

  const updateAddressInfo = (newAddress: Address) => {
    const updatedAddressData: CreateGuideAddressDataToneFormValues = {
      street1: newAddress.addressName,
      external_number: newAddress.externalNumber,
      neighborhood: newAddress.neighborhood,
      town: newAddress?.town?.[0],
      state: newAddress.state,
      reference: newAddress.reference,
    }
    updateSavedAlias({ alias: newAddress.alias, address: updatedAddressData })
  }

  if (useTempAddress) {
    return (
      <AddTempAddressTone
        addressData={addressData}
        goNext={goNext}
        updateAddress={updateAddress}
        toggleTempAddressModal={toggleTempAddress}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <AddAddressCreateGuide
        PersonalDataUI={
          <PersonalDataTone<CreateGuidePersonalDataToneFormValues>
            addressData={addressData}
            errors={errors}
            register={register}
          />
        }
        SubmitFormUI={
          <div className="flex justify-between mt-8">
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
        }
        CreateTempAddressButton={
          <div className="my-4 w-full flex justify-end">
            <Button outline onClick={toggleTempAddress}>Usar dirección temporal</Button>
          </div>
        }
      >
        <SelectAddressDropdown
          aliasSelected={aliasSelected}
          setAliasSelected={setAliasSelected}
          updateAddressInfo={updateAddressInfo}
          errorMessage={addressError}
          setErrorMessage={setAddressError}
        />
      </AddAddressCreateGuide>
    </form>
  )
}