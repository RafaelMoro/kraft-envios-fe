"use client"
import { Button } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  AddPersonalDataFormSchema,
  CreateGuideAddressFormValuesMn,
  AliasSavedMn,
  PersonalDataFormValues,
  AddressType,
} from "@/shared/types/guides.types";
import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide";
import { PersonalDataForm } from "@/features/Guides/PersonalDataForm";
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown";
import { Address, UpdateAddressInfoPayload } from "@/shared/types/addresses.types";
import { useAddAddress } from "@/shared/hooks/useAddAddress";
import { AddTempAddressMn } from "@/features/Guides/Mn/AddTempAddressMn";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";

interface AddAddressGuideDbProps {
  title: string
  addressData: CreateGuideAddressFormValuesMn
  aliasSaved: AliasSavedMn
  isMobileTablet: boolean
  isDestination?: boolean
  excludedAlias?: string
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesMn) => void
  updateSavedAlias: ({
    alias, address, addressMn, town, city,
  }: {
    alias: string;
    address: Address;
    addressMn: {
      street1: string;
      external_number: string;
      neighborhood: string;
      city: string;
      state: string;
      reference: string
    }; town: string; city: string
  }) => void
}

export const AddAddressGuideDb = ({
  isDestination = false, title, addressData, aliasSaved, excludedAlias, isMobileTablet, goNext, goPrev, toggleModal, updateAddress, updateSavedAlias,
}: AddAddressGuideDbProps) => {
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
    toggleTempAddress,
  } = useAddAddress({ isDestination, alias: aliasSaved.alias, toggleModal, goPrev });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<PersonalDataFormValues>({
    resolver: yupResolver(AddPersonalDataFormSchema),
  });

  const onSubmit: SubmitHandler<PersonalDataFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!aliasSelected) {
      setAddressError("Por favor selecciona un alias de dirección");
      return;
    }
    if (excludedAlias && aliasSelected === excludedAlias) {
      setAddressError("El domicilio destino no puede ser el mismo que el origen");
      return;
    }
    if (!aliasSaved.addressMn) {
      setAddressError("La dirección seleccionada no es válida");
      return;
    }
    if (!aliasSaved.addressMn.city) {
      setCityError("Por favor selecciona una ciudad");
      return;
    }

    const addressMn = aliasSaved.addressMn
    const allData: CreateGuideAddressFormValuesMn = {
      ...data,
      ...addressMn,
    }
    updateAddress(allData)
    goNext()
  }

  const updateAddressInfo = ({ newAddress, town, city }: UpdateAddressInfoPayload) => {
    const updatedAddressData = {
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
        addressType={addressType as AddressType}
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
          <PersonalDataForm<PersonalDataFormValues>
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
              data-testid={`${addressType}-address-guide-db-cancel-button`}
              className="hover:cursor-pointer"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </Button>
            <Button data-testid={`${addressType}-address-guide-db-next-button`} type="submit" className="hover:cursor-pointer">
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
          excludedAlias={excludedAlias}
        />
      </AddAddressCreateGuide>
      {Object.keys(errors).length > 0 && (
        <ErrorMessage>Por favor completa los datos personales.</ErrorMessage>
      )}
    </form>
  )
}
