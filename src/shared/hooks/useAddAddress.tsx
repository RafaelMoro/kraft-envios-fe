"use client"
import { useState } from "react";
import { useSelectAlias } from "./useAlias";
import { AddressType } from "../types/guides.types";

interface UseAddAddressProps {
  isDestination: boolean
  alias: string
  toggleModal: () => void
  goPrev: () => void
}

/**
 * This hook is the repeated code in each AddAddress component for Guides
 */
export const useAddAddress = ({ isDestination, alias, toggleModal, goPrev }: UseAddAddressProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);

  const cancelColorButton = isDestination ? "light" : "red"
  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"
  const addressType: AddressType = isDestination ? 'destination' : 'origin'

  const {
    aliasSelected, setAliasSelected, addressError, setAddressError, townError, cityError, setTownError, setCityError, resetAliasSelected
  } = useSelectAlias({ aliasSaved: alias });

  const handleCancel = () => {
    resetAliasSelected();
    if (isDestination) {
      goPrev()
      return
    }

    toggleModal()
  }

  return {
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
    toggleTempAddress
  }
}