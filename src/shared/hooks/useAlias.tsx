"use client"
import { useRef, useState } from "react";
import { AllAliasesSavedTone, AllAliasSavedMn, CreateGuideAddressDataMnFormValues, CreateGuideAddressDataToneFormValues } from "../types/guides.types";
import { initialAliasesMn, initialAliasesTone } from "../constants/guides.constants";
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
  const aliasesTone = useRef<AllAliasesSavedTone>(structuredClone(initialAliasesTone))
  const aliasesMn = useRef<AllAliasSavedMn>(structuredClone(initialAliasesMn))

  const updateOriginAliasMn = ({
    alias, address, addressMn, town, city
  }: {
    alias: string; address: Address; addressMn: CreateGuideAddressDataMnFormValues; town: string; city: string
  }) => {
    aliasesMn.current.origin.alias = alias
    aliasesMn.current.origin.town = town
    aliasesMn.current.origin.city = city
    aliasesMn.current.origin.address = address
    aliasesMn.current.origin.addressMn = addressMn
  }

  const updateDestinationAliasMn = ({
    alias, address, addressMn, town, city
  }: {
    alias: string; address: Address; addressMn: CreateGuideAddressDataMnFormValues; town: string; city: string
  }) => {
    aliasesMn.current.destination.alias = alias
    aliasesMn.current.destination.town = town
    aliasesMn.current.destination.city = city
    aliasesMn.current.destination.address = address
    aliasesMn.current.destination.addressMn = addressMn
  }

  const updateOriginAliasTone = ({
    alias, address, addressTone, town, city
  }:{ 
    alias: string; address: Address; addressTone: CreateGuideAddressDataToneFormValues; town: string; city: string
  }) => {
    aliasesTone.current.origin.alias = alias
    aliasesTone.current.origin.town = town
    aliasesTone.current.origin.city = city
    aliasesTone.current.origin.address = address
    aliasesTone.current.origin.addressTone = addressTone
  }
  const updateDestinationAliasTone = ({
    alias, address, addressTone, town, city
  }:{ 
    alias: string; address: Address; addressTone: CreateGuideAddressDataToneFormValues; town: string; city: string
  }) => {
    aliasesTone.current.destination.alias = alias
    aliasesTone.current.destination.town = town
    aliasesTone.current.destination.city = city
    aliasesTone.current.destination.address = address
    aliasesTone.current.destination.addressTone = addressTone
  }

  const resetAliases = () => {
    const resetedAliasTone = structuredClone(initialAliasesTone)
    const resetedAliasMn = structuredClone(initialAliasesMn)
    aliasesTone.current = resetedAliasTone
    aliasesMn.current = resetedAliasMn
  }
  
  return {
    aliasesTone: aliasesTone.current,
    aliasesMn: aliasesMn.current,
    updateOriginAliasTone,
    updateOriginAliasMn,
    updateDestinationAliasTone,
    updateDestinationAliasMn,
    resetAliases,
  }
}