"use client"
import { useRef, useState } from "react";
import { AllAliasesSavedTone, CreateGuideAddressDataToneFormValues } from "../types/guides.types";
import { initialAliases } from "../constants/guides.constants";
import { Address } from "../types/addresses.types";

/**
 * Hook to manage a selected alias and handle select alias error with component `SelectAddressDropdown`
 */
export const useSelectAlias = ({  aliasSaved }: { aliasSaved: string }) => {
  const [aliasSelected, setAliasSelected] = useState(aliasSaved);
  const [addressError, setAddressError] = useState<string>("");
  const [townError, setTownError] = useState<string>("");
  const [cityError, setCityError] = useState<string>("");

  const resetAliasSelected = () => {
    setAliasSelected("");
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
    resetAliasSelected,
  }
}

/**
 * Hook to save Alias selected for Origin and Destination addresses
 */
export const useSaveAlias = () => {
  const aliases = useRef<AllAliasesSavedTone>({...initialAliases})
  const updateOriginAlias = ({
    alias, address, addressTone, town
  }:{ 
    alias: string; address: Address; addressTone: CreateGuideAddressDataToneFormValues; town: string
  }) => {
    aliases.current.origin.alias = alias
    aliases.current.origin.town = town
    aliases.current.origin.address = address
    aliases.current.origin.addressTone = addressTone
  }
  const updateDestinationAlias = ({
    alias, address, addressTone, town
  }:{ 
    alias: string; address: Address; addressTone: CreateGuideAddressDataToneFormValues; town: string
  }) => {
    aliases.current.destination.alias = alias
    aliases.current.destination.town = town
    aliases.current.destination.address = address
    aliases.current.destination.addressTone = addressTone
  }
  const resetAliases = () => {
    console.log('resetAliases called')
    const resetedAlias = {...initialAliases}
    console.log('resetedAlias', resetedAlias)
    aliases.current = resetedAlias
  }
  
  return {
    aliases: aliases.current,
    updateOriginAlias,
    updateDestinationAlias,
    resetAliases
  }
}