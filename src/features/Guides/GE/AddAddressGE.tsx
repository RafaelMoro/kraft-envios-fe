"use client"
import { useRef, useState } from "react";

import { SelectOnlyAddressDropdown } from "@/features/Addresses/SelectOnlyAddressDropdown";
import { CreateGuideFormValuesGE } from "@/shared/types/guides.types";
import { initialStateCreateGuideGE } from "@/shared/constants/guides.constants";

export const AddAddressGE = () => {
  const formData = useRef<CreateGuideFormValuesGE>({...initialStateCreateGuideGE})
  const updateOriginAddress = (newAlias: string) => {
    formData.current.originAddress.alias = newAlias
  }

  const [addressError, setAddressError] = useState<string>("");

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xl">Domicilio</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">Selecciona una dirección.</p>
      <SelectOnlyAddressDropdown
        addressData={formData.current.originAddress}
        errorMessage={addressError}
        handleSelectAlias={updateOriginAddress}
      />
    </div>
  )
}