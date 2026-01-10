"use client"
import { useState } from "react";
import { Button } from "flowbite-react";

import { SelectOnlyAddressDropdown } from "@/features/Addresses/SelectOnlyAddressDropdown";
import { AddressExtraInfoGE, AddressInfoFormGE } from "@/shared/types/guides.types";

interface AddAddressGEProps {
  typeAddress: 'origin' | 'destination';
  addressData: AddressInfoFormGE;
  aliasError: string | null
  updateAddress: (data: AddressInfoFormGE) => boolean
  setAliasError: (newError: string) => void;
  toggleModal: () => void;
  goNext: () => void
  goPrev: () => void
}

export const AddAddressGE = ({
  typeAddress, addressData, aliasError, setAliasError, toggleModal, updateAddress, goNext, goPrev
}: AddAddressGEProps) => {
  const [selectedAlias, setSelectedAlias] = useState<string | null>(addressData?.address?.alias ?? null)
  const [addressInfo, setAddressInfo] = useState<AddressExtraInfoGE | null>(addressData?.information ?? null)
  const handleSelectAlias = ({ newAlias, addressInfo }:{ newAlias: string, addressInfo: AddressExtraInfoGE }) => {
    setSelectedAlias(newAlias)
    setAddressInfo(addressInfo)
  }

  const typeAddressLabel = typeAddress === 'origin' ? 'origen' : 'destino'
  const cancelButtonText = typeAddress === 'destination' ? 'Regresar' : 'Cancelar'
  const colorCancelButton = typeAddress === 'destination' ? 'light' : 'red'

  const handleNextStep = () => {
    if (aliasError) {
      return;
    }

    if (!selectedAlias) {
      // show error
      setAliasError("Por favor, selecciona un alias para continuar.")
      return;
    }
    if (!addressInfo) {
      console.warn('No address info available to update address')
      return
    }

    const newData: AddressInfoFormGE = {
      address: {
        alias: selectedAlias
      },
      information: addressInfo
    }
    const canGoNext = updateAddress(newData)
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
    <div className="flex flex-col gap-4">
      <h4 className="text-xl">Domicilio</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Selecciona un alias de {typeAddressLabel}. El alias debe de existir en GE para continuar.
      </p>
      <SelectOnlyAddressDropdown
        aliasSelected={selectedAlias}
        aliasError={aliasError}
        updateAliasSelection={handleSelectAlias}
        setAliasError={setAliasError}
      />
      <div className="w-full mt-7 flex flex-col md:flex-row md:justify-between gap-4">
        <Button
          {...(typeAddress === 'origin' && { outline: true })}
          color={colorCancelButton}
          onClick={handleCancel}
        >{cancelButtonText}</Button>
        <Button disabled={!selectedAlias} onClick={handleNextStep}>Siguiente</Button>
      </div>
    </div>
  )
}