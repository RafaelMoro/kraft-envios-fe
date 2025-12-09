"use client"
import { useState } from "react";

import { useSelectAlias } from "@/shared/hooks/useAlias";
import { AddTempAddressMn } from "./AddTempAddressMn";
import { CreateGuideAddressFormValuesMn } from "@/shared/types/guides.types";
import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide";

interface AddAddressMnProps {
  title: string
  addressData: CreateGuideAddressFormValuesMn
  isMobileTablet: boolean
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesMn) => void
}

export const AddAddressMn = ({
  isDestination, title, addressData, isMobileTablet, goNext, goPrev, toggleModal, updateAddress
}: AddAddressMnProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);

  // TODO: Change alias saved
  const {
    aliasSelected, setAliasSelected, addressError, setAddressError, townError, cityError, setTownError, setCityError, resetAliasSelected
  } = useSelectAlias({ aliasSaved: '' });

  const cancelColorButton = isDestination ? "light" : "red"
  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"

  const handleCancel = () => {
    resetAliasSelected();
    if (isDestination) {
      goPrev()
      return
    }

    toggleModal()
  }

  if (useTempAddress) {
    return (
      <AddTempAddressMn
        title={title}
        goNext={goNext}
        updateAddress={updateAddress}
        addressData={addressData}
        isMobileTablet={isMobileTablet}
        toggleModal={toggleTempAddress}
        goPrev={goPrev}
      />
    )
  }

  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
    >
      {/* <AddAddressCreateGuide
        PersonalDataUI={
          <PersonalDataTone<CreateGuidePersonalDataToneFormValues>
            addressData={addressData}
            errors={errors}
            register={register}
          />
        }
      >

      </AddAddressCreateGuide> */}
    </form>
  )
}