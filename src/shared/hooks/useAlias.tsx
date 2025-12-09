"use client"
import { useRef, useState } from "react";
import { AllAliasesSavedTone, CreateGuideAddressDataToneFormValues } from "../types/guides.types";
import { initialAliases } from "../constants/guides.constants";

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
    alias, address, town
  }:{ 
    alias: string; address: CreateGuideAddressDataToneFormValues; town: string
  }) => {
    aliases.current.origin.alias = alias
    aliases.current.origin.town = town
    aliases.current.origin.address = address
  }
  const updateDestinationAlias = ({
    alias, address, town
  }:{ 
    alias: string; address: CreateGuideAddressDataToneFormValues; town: string
  }) => {
    aliases.current.destination.alias = alias
    aliases.current.destination.town = town
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