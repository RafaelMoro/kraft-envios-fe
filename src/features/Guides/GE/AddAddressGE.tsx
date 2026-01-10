"use client"
import { useState } from "react";
import { Button } from "flowbite-react";

import { SelectOnlyAddressDropdown } from "@/features/Addresses/SelectOnlyAddressDropdown";
import { CreateGuideAddressValuesGE } from "@/shared/types/guides.types";

interface AddAddressGEProps {
  typeAddress: 'origin' | 'destination';
  addressData: CreateGuideAddressValuesGE;
  aliasError: string | null
  updateAddress: (data: CreateGuideAddressValuesGE) => boolean
  setAliasError: (newError: string) => void;
  toggleModal: () => void;
  goNext: () => void
  goPrev: () => void
}

export const AddAddressGE = ({
  typeAddress, addressData, aliasError, setAliasError, toggleModal, updateAddress, goNext, goPrev
}: AddAddressGEProps) => {
  const [selectedAlias, setSelectedAlias] = useState<string | null>(addressData?.alias ?? null)

  const typeAddressLabel = typeAddress === 'origin' ? 'origen' : 'destino'
  const cancelButtonText = typeAddress === 'destination' ? 'Regresar' : 'Cancelar'

  const handleNextStep = () => {
    // save info
    if (!selectedAlias) {
      // show error
      setAliasError("Por favor, selecciona un alias para continuar.")
      return;
    }

    const canGoNext = updateAddress({ alias: selectedAlias })
    if (canGoNext) {
      goNext()
    }
  }

  const handleCancel = () => {
    if (typeAddress === 'destination') {
      goPrev()
      return;
    }

    toggleModal()
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h4 className="text-xl">Domicilio</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Selecciona un alias de {typeAddressLabel}. El alias debe de existir en GE para continuar.
      </p>
      <SelectOnlyAddressDropdown
        aliasSelected={selectedAlias}
        aliasError={aliasError}
        updateAliasSelection={setSelectedAlias}
        setAliasError={setAliasError}
      />
      <div className="flex flex-col gap-4">
        <Button
          outline
          color="red"
          onClick={handleCancel}
        >{cancelButtonText}</Button>
        <Button disabled={!selectedAlias} onClick={handleNextStep}>Siguiente</Button>
      </div>
    </div>
  )
}