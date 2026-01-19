"use client";
import { ReactNode, useState } from "react";
import { ToggleSwitch } from "flowbite-react";

interface AddressRegionSelectorProps {
  ManualFieldsUI: ReactNode;
  AutocompleteUI: ReactNode;
}

/**
 * This component allows to switch between manual region fields and autocomplete region fields
 */
export const AddressRegionSelector = ({
  ManualFieldsUI,
  AutocompleteUI,
}: AddressRegionSelectorProps) => {
  const [showManualFields, setShowManualFields] = useState(false);

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
