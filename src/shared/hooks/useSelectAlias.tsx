"use client"
import { useRef, useState } from "react";
import { CreateGuideAddressDataToneFormValues } from "../types/guides.types";

export const useSelectAlias = () => {
  const [aliasSelected, setAliasSelected] = useState("");
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