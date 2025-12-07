"use client"
import { useRef, useState } from "react";
import { AllAliasesSavedTone, CreateGuideAddressDataToneFormValues } from "../types/guides.types";
import { initialAliases } from "../constants/guides.constants";

/**
 * Hook to manage a selected alias and handle select alias error with component `SelectAddressDropdown`
 */
export const useSelectAlias = ({  aliasSaved, address }: { aliasSaved: string, address: CreateGuideAddressDataToneFormValues | null }) => {
  const [aliasSelected, setAliasSelected] = useState(aliasSaved);
  const [addressError, setAddressError] = useState<string>("");
  const addressSelectedTone = useRef<CreateGuideAddressDataToneFormValues | null>(address);

  const updateAddressSelectedTone = (address: CreateGuideAddressDataToneFormValues) => {
    addressSelectedTone.current = address;
  }
  return {
    aliasSelected,
    setAliasSelected,
    addressError,
    setAddressError,
    addressSelectedTone: addressSelectedTone.current,
    updateAddressSelectedTone
  }
}

/**
 * Hook to save Alias selected for Origin and Destination addresses
 */
export const useSaveAlias = () => {
  const aliases = useRef<AllAliasesSavedTone>({...initialAliases})
  const updateOriginAlias = ({ alias, address }: { alias: string; address: CreateGuideAddressDataToneFormValues }) => {
    aliases.current.origin.alias = alias
    aliases.current.origin.address = address
  }
  const updateDestinationAlias = ({ alias, address }: { alias: string; address: CreateGuideAddressDataToneFormValues }) => {
    aliases.current.destination.alias = alias
    aliases.current.destination.address = address
  }
  const resetAliases = () => {
    aliases.current = {...initialAliases}
  }
  
  return {
    aliases: aliases.current,
    updateOriginAlias,
    updateDestinationAlias,
    resetAliases
  }
}