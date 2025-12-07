import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import { PersonalDataTone } from "./PersonalDataTone"
import { AddAddressToneFormSchema, AddressTonePersonalDataFormValues, CreateGuideAddressFormValuesTone, CreateGuideFormValuesTone } from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address } from "@/shared/types/addresses.types"

interface AddAddressToneProps {
  formData: CreateGuideFormValuesTone;
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
}

export const AddAddressTone = ({ formData, updateAddress }: AddAddressToneProps) => {
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

  return (
    <AddAddressCreateGuide
      PersonalDataUI={() => (
        <PersonalDataTone<AddressTonePersonalDataFormValues>
          addressData={formData.originAddress}
          errors={errors}
          register={register}
        />
      )}
      CreateTempAddressButton={<button>Crear dirección temporal</button>}
    >
      <SelectAddressDropdown
        aliasSelected={aliasSelected}
        setAliasSelected={setAliasSelected}
        updateAddressInfo={updateAddressInfo}
      />
    </AddAddressCreateGuide>
  )
}