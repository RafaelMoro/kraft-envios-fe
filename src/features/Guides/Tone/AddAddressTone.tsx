import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "flowbite-react"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import {
  CreateGuideAddressFormValuesTone, CreateGuideAddressDataToneFormValues,
  AliasSavedTone,
  PersonalDataFormValues,
  AddPersonalDataFormSchema
} from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types"
import { AddTempAddressTone } from "./AddTempAddressTone"
import { useAddAddress } from "@/shared/hooks/useAddAddress"
import { PersonalDataForm } from "../PersonalDataForm"

interface AddAddressToneProps {
  addressData: CreateGuideAddressFormValuesTone
  aliasSaved: AliasSavedTone;
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
  updateSavedAlias: ({
    alias, address, addressTone, town, city
  }: {
    alias: string; address: Address; addressTone: CreateGuideAddressDataToneFormValues; town: string; city: string
  }) => void
}

export const AddAddressTone = ({
  addressData, aliasSaved, updateAddress, isDestination =  false, goNext, goPrev, toggleModal, updateSavedAlias
}: AddAddressToneProps) => {
  
  const {
    aliasSelected,
    setAliasSelected,
    addressError,
    setAddressError,
    townError,
    cityError,
    setTownError,
    setCityError,
    handleCancel,
    addressType,
    cancelButtonText,
    cancelColorButton,
    useTempAddress,
    toggleTempAddress
  } = useAddAddress({ isDestination, alias: aliasSaved.alias, toggleModal, goPrev });

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<PersonalDataFormValues>({
    resolver: yupResolver(AddPersonalDataFormSchema)
  })

  const onSubmit: SubmitHandler<PersonalDataFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!aliasSelected) {
      setAddressError("Por favor selecciona un alias de dirección");
      return;
    }
    if (!aliasSaved.addressTone) {
      setAddressError("La dirección seleccionada no es válida");
      console.warn("Address selected is null");
      return;
    }
    if (!aliasSaved.addressTone.town) {
      setTownError("Por favor selecciona un municipio");
      return;
    }

    const allData: CreateGuideAddressFormValuesTone = {
      ...data,
      ...aliasSaved.addressTone
    }
    updateAddress(allData)
    goNext()
  }

  /**
   * This function formats the address info into the address expected type of Tone
   */
  const updateAddressInfo = ({ newAddress, town, city }: UpdateAddressInfoPayload) => {
    const updatedAddressData: CreateGuideAddressDataToneFormValues = {
      street1: newAddress.addressName,
      external_number: newAddress.externalNumber,
      neighborhood: newAddress.neighborhood,
      town,
      state: newAddress.state,
      reference: newAddress.reference,
    }
    updateSavedAlias({ alias: newAddress.alias, address: newAddress, addressTone: updatedAddressData, town, city })
  }

  if (useTempAddress) {
    return (
      <AddTempAddressTone
        addressData={addressData}
        addressType={addressType}
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
          <PersonalDataForm<PersonalDataFormValues>
            addressData={addressData}
            errors={errors}
            register={register}
            hideCompanyField
          />
        }
        SubmitFormUI={
          <div className="flex justify-between mt-8">
            <Button
              {...(!isDestination && { outline: true })}
              color={cancelColorButton}
              data-testid={`${addressType}-address-tone-cancel-button`}
              className="hover:cursor-pointer"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </Button>
            <Button data-testid={`${addressType}-address-tone-next-button`} type="submit" className="hover:cursor-pointer">
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
          aliasSaved={aliasSaved}
          setAliasSelected={setAliasSelected}
          updateAddressInfo={updateAddressInfo}
          errorMessage={addressError}
          townError={townError}
          cityError={cityError}
          setErrorMessage={setAddressError}
          setTownError={setTownError}
          setCityError={setCityError}
        />
      </AddAddressCreateGuide>
    </form>
  )
}