"use client";
import { ReactNode } from "react";
import clsx from "clsx"
import { ToggleSwitch } from "flowbite-react";

interface AddressRegionSelectorProps {
  showManualFields: boolean;
  ManualFieldsUI: ReactNode;
  AutocompleteUI: ReactNode;
  placeButton?: "top" | "center" | "bottom";
  setShowManualFields: () => void;
}

/**
 * This component allows to switch between manual region fields and autocomplete region fields
 */
export const AddressRegionSelector = ({
  ManualFieldsUI,
  AutocompleteUI,
  showManualFields,
  placeButton = "top",
  setShowManualFields,
}: AddressRegionSelectorProps) => {
  const buttonCss = clsx({
    "self-end": placeButton === "bottom",
    "self-center": placeButton === "center",
  })

  return (
    <>
      {showManualFields && ManualFieldsUI}
      {!showManualFields && AutocompleteUI}
      <div className={buttonCss}>
        <ToggleSwitch
          checked={showManualFields}
          label="Completar región manualmente"
          onChange={setShowManualFields}
        />
      </div>
    </>
  );
};
