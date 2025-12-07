"use client"
import { useRef, useState } from "react";
import { AliasesSaved, CreateGuideAddressDataToneFormValues } from "../types/guides.types";
import { initialAliases } from "../constants/guides.constants";

/**
 * Hook to manage a selected alias and handle select alias error with component `SelectAddressDropdown`
 */
export const useSelectAlias = ({  aliasSaved }: { aliasSaved: string }) => {
  const [aliasSelected, setAliasSelected] = useState(aliasSaved);
  const [addressError, setAddressError] = useState<string>("");
  const addressSelectedTone = useRef<CreateGuideAddressDataToneFormValues | null>(null);

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
  const aliases = useRef<AliasesSaved>({...initialAliases})
  const updateOriginAlias = (alias: string) => {
    aliases.current.origin = alias
  }
  const updateDestinationAlias = (alias: string) => {
    aliases.current.destination = alias
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