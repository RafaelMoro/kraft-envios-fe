"use client"
import { useRef, useState } from "react";
import { CreateGuideAddressDataToneFormValues } from "../types/guides.types";

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