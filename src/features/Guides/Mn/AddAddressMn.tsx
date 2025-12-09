"use client"
import { useState } from "react";
import { Button } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useSelectAlias } from "@/shared/hooks/useAlias";
import { AddTempAddressMn } from "./AddTempAddressMn";
import { 
  AddPersonalDataMnFormSchema, 
  CreateGuideAddressFormValuesMn, 
  CreateGuidePersonalDataMnFormValues,
  AliasSavedMn,
  CreateGuideAddressDataMnFormValues
} from "@/shared/types/guides.types";
import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide";
import { PersonalDataMn } from "./PersonalDataMn";
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown";
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types";

interface AddAddressMnProps {
  title: string
  addressData: CreateGuideAddressFormValuesMn
  aliasSaved: AliasSavedMn;
  isMobileTablet: boolean
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesMn) => void
  updateSavedAlias: ({
    alias, address, addressMn, town, city
  }: {
    alias: string; address: Address; addressMn: CreateGuideAddressDataMnFormValues; town: string; city: string
  }) => void
}

export const AddAddressMn = ({
  isDestination, title, addressData, aliasSaved, isMobileTablet, goNext, goPrev, toggleModal, updateAddress, updateSavedAlias
}: AddAddressMnProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);

  const {
    aliasSelected, setAliasSelected, addressError, setAddressError, townError, cityError, setTownError, setCityError, resetAliasSelected
  } = useSelectAlias({ aliasSaved: aliasSaved.alias });

  const cancelColorButton = isDestination ? "light" : "red"
  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"
  const addressType = isDestination ? 'destination' : 'origin'

  const handleCancel = () => {
    resetAliasSelected();
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
  } = useForm<CreateGuidePersonalDataMnFormValues>({
    resolver: yupResolver(AddPersonalDataMnFormSchema)
  })

  const onSubmit: SubmitHandler<CreateGuidePersonalDataMnFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!aliasSelected) {
      setAddressError("Por favor selecciona un alias de dirección");
      return;
    }
    if (!aliasSaved.addressMn) {
      setAddressError("La dirección seleccionada no es válida");
      console.warn("Address selected is null");
      return;
    }
    if (!aliasSaved.addressMn.city) {
      setCityError("Por favor selecciona una ciudad");
      return;
    }

    const allData: CreateGuideAddressFormValuesMn = {
      ...data,
      ...aliasSaved.addressMn
    }
    updateAddress(allData)
    goNext()
  }

  /**
   * This function formats the address info into the address expected type of Mn
   */
  const updateAddressInfo = ({ newAddress, town, city }: UpdateAddressInfoPayload) => {
    const updatedAddressData: CreateGuideAddressDataMnFormValues = {
      street1: newAddress.addressName,
      external_number: newAddress.externalNumber,
      neighborhood: newAddress.neighborhood,
      city: city || newAddress.city?.[0] || "",
      state: newAddress.state,
      reference: newAddress.reference,
    }
    updateSavedAlias({ alias: newAddress.alias, address: newAddress, addressMn: updatedAddressData, town, city })
  }

  if (useTempAddress) {
    return (
      <AddTempAddressMn
        title={title}
        addressType={addressType}
        goNext={goNext}
        updateAddress={updateAddress}
        addressData={addressData}
        isMobileTablet={isMobileTablet}
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
          <PersonalDataMn<CreateGuidePersonalDataMnFormValues>
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
              data-testid={`${addressType}-address-mn-cancel-button`}
              className="hover:cursor-pointer"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </Button>
            <Button data-testid={`${addressType}-address-mn-next-button`} type="submit" className="hover:cursor-pointer">
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