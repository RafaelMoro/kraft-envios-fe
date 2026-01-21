"use client";
import { ReactNode } from "react";
import { ToggleSwitch } from "flowbite-react";

interface AddressRegionSelectorProps {
  showManualFields: boolean;
  setShowManualFields: (value: boolean) => void;
  ManualFieldsUI: ReactNode;
  AutocompleteUI: ReactNode;
}

/**
 * This component allows to switch between manual region fields and autocomplete region fields
 */
export const AddressRegionSelector = ({
  ManualFieldsUI,
  AutocompleteUI,
  showManualFields,
  setShowManualFields,
}: AddressRegionSelectorProps) => {
  return (
    <>
      {showManualFields && ManualFieldsUI}
      {!showManualFields && AutocompleteUI}
      <ToggleSwitch
        checked={showManualFields}
        label="Completar región manualmente"
        onChange={setShowManualFields}
      />
    </>
  );
};
