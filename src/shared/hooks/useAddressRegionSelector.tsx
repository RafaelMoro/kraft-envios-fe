import { useState } from "react";

interface UseAddressRegionSelectorProps {
  clearManualAddressRegionFields: () => void;
}

export const useAddressRegionSelector = ({ clearManualAddressRegionFields }: UseAddressRegionSelectorProps) => {
  // State for address region selector
  const [showManualFields, setShowManualFields] = useState(false);
  const toggleShowManualFields = () => {
    setShowManualFields((prev) => {
      if (prev === true) {
        clearManualAddressRegionFields();
      }
      return !prev;
    });
  };

  return {
    showManualFields,
    toggleShowManualFields,
  }
}