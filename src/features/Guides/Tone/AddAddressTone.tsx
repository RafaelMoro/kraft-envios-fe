import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "flowbite-react"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import { PersonalDataTone } from "./PersonalDataTone"
import { AddAddressToneFormSchema, AddressTonePersonalDataFormValues, CreateGuideAddressFormValuesTone, CreateGuideFormValuesTone } from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address } from "@/shared/types/addresses.types"
import { AddTempAddressTone } from "./AddTempAddressTone"

interface AddAddressToneProps {
  addressData: CreateGuideAddressFormValuesTone
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
}

export const AddAddressTone = ({
  addressData, updateAddress, isDestination, goNext, goPrev, toggleModal
}: AddAddressToneProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);

  const [aliasSelected, setAliasSelected] = useState("");

  const {
    register,
    formState: { errors },
  } = useForm<AddressTonePersonalDataFormValues>({
    resolver: yupResolver(AddAddressToneFormSchema)
  })

  const updateAddressInfo = (newAddress: Address) => {
    const updatedAddressData: CreateGuideAddressFormValuesTone = {
      street1: newAddress.addressName,
      external_number: newAddress.externalNumber,
      neighborhood: newAddress.neighborhood,
      town: newAddress?.town?.[0],
      state: newAddress.state,
      reference: newAddress.reference,
      // TODO: Update these fields when available
      name: '',
      lastName: '',
      phone: ''
    }
    updateAddress(updatedAddressData)
  }

  if (useTempAddress) {
    return (
      <AddTempAddressTone
        addressData={addressData}
        goNext={goNext}
        updateAddress={updateAddress}
        isDestination={isDestination}
        toggleModal={toggleModal}
        goPrev={toggleTempAddress}
      />
    )
  }

  return (
    <AddAddressCreateGuide
      PersonalDataUI={() => (
        <PersonalDataTone<AddressTonePersonalDataFormValues>
          addressData={addressData}
          errors={errors}
          register={register}
        />
      )}
      CreateTempAddressButton={<Button onClick={toggleTempAddress}>Usar dirección temporal</Button>}
    >
      <SelectAddressDropdown
        aliasSelected={aliasSelected}
        setAliasSelected={setAliasSelected}
        updateAddressInfo={updateAddressInfo}
      />
    </AddAddressCreateGuide>
  )
}