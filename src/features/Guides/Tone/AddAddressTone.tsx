import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import { PersonalDataTone } from "./PersonalDataTone"
import { AddAddressToneFormSchema, AddressTonePersonalDataFormValues, CreateGuideFormValuesTone } from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"

interface AddAddressToneProps {
  formData: CreateGuideFormValuesTone
}

export const AddAddressTone = ({ formData }: AddAddressToneProps) => {
  const [aliasSelected, setAliasSelected] = useState("");

  const {
    register,
    formState: { errors },
  } = useForm<AddressTonePersonalDataFormValues>({
    resolver: yupResolver(AddAddressToneFormSchema)
  })

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
      <SelectAddressDropdown aliasSelected={aliasSelected} setAliasSelected={setAliasSelected} />
    </AddAddressCreateGuide>
  )
}