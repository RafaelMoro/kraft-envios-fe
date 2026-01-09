"use client"
import { useRef } from "react";

import { SelectOnlyAddressDropdown } from "@/features/Addresses/SelectOnlyAddressDropdown";
import { CreateGuideFormValuesGE } from "@/shared/types/guides.types";
import { initialStateCreateGuideGE } from "@/shared/constants/guides.constants";

export const AddAddressGE = () => {
  const formData = useRef<CreateGuideFormValuesGE>({...initialStateCreateGuideGE})
  const updateOriginAlias = (newAlias: string) => {
    formData.current.originAddress.alias = newAlias
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h4 className="text-xl">Domicilio</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">Selecciona una dirección.</p>
      <SelectOnlyAddressDropdown
        addressData={formData.current.originAddress}
        updateAliasSelection={updateOriginAlias}
      />
    </div>
  )
}