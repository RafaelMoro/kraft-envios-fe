"use client";
import { ReactNode, useState } from "react";
import { ToggleSwitch } from "flowbite-react";

interface AddressRegionSelectorProps {
  ManualFieldsUI: ReactNode;
  AutocompleteUI: ReactNode;
}

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
