import { useState } from "react";
import { Button, ToggleSwitch } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAddAddress } from "@/shared/hooks/useAddAddress";
import { AddPersonalDataFormSchema, AliasesSavedPkk, CreateGuideAddressDataPkkFormValues, CreateGuideAddressValuesPkk, PersonalDataFormValues } from "@/shared/types/guides.types";
import { AddTempAddressPkk } from "./AddTempAddressPkk";
import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide";
import { PersonalDataForm } from "../PersonalDataForm";
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown";
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types";

interface AddAddressPkkProps {
  isDestination?: boolean
  addressData: CreateGuideAddressValuesPkk;
  aliasSaved: AliasesSavedPkk
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressValuesPkk) => void
  updateSavedAlias: ({
    alias, address, addressPkk, town, city
  }: {
    alias: string; address: Address; addressPkk: CreateGuideAddressDataPkkFormValues; town: string; city: string
  }) => void
}

export const AddAddressPkk = ({
  isDestination = false, addressData, aliasSaved, goPrev, goNext, toggleModal, updateAddress, updateSavedAlias
}: AddAddressPkkProps) => {
  const [isResidential, setIsResidential] = useState(addressData.isResidential);
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
    if (!aliasSaved.addressPkk) {
      setAddressError("La dirección seleccionada no es válida");
      console.warn("Address selected is null");
      return;
    }

    const allData: CreateGuideAddressValuesPkk = {
      ...data,
      isResidential,
      ...aliasSaved.addressPkk
    }
    updateAddress(allData)
    goNext()
  }

  const updateAddressInfo = ({ newAddress, town, city }: UpdateAddressInfoPayload) => {
    const updatedAddressData: CreateGuideAddressDataPkkFormValues = {
      street1: newAddress.addressName,
      neighborhood: newAddress.neighborhood,
      city: city || newAddress.city?.[0] || "",
      state: newAddress.state,
      zipcode: newAddress.zipcode,
    }
    updateSavedAlias({ alias: newAddress.alias, address: newAddress, addressPkk: updatedAddressData, town, city })
  }

  if (useTempAddress) {
    return (
      <AddTempAddressPkk
        addressData={addressData}
        addressType={addressType}
        goNext={goNext}
        updateAddress={updateAddress}
        toggleTempAddress={toggleTempAddress}
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
              data-testid={`${addressType}-address-pkk-cancel-button`}
              className="hover:cursor-pointer"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </Button>
            <Button data-testid={`${addressType}-address-pkk-next-button`} type="submit" className="hover:cursor-pointer">
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
        <div className="w-full flex justify-start">
          <ToggleSwitch checked={isResidential} label="Es residencial" onChange={setIsResidential} />
        </div>
      </AddAddressCreateGuide>
    </form>
  )
}