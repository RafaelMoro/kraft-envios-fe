import { useState } from "react";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "../constants/addresses.constants";
import { UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import { CreateAddressFormValues } from "../types/addresses.types";

interface UseAutocompleteZipcodeProps {
  setValue: UseFormSetValue<CreateAddressFormValues>;
  clearErrors: UseFormClearErrors<CreateAddressFormValues>;
}

/**
 * This custom hook is to be used with the component `AutocompleteZipcode`
 */
export const useAutocompleteZipcode = ({
  setValue,
  clearErrors,
}: UseAutocompleteZipcodeProps) => {
  const [zipcode, setZipcode] = useState<string>("");
  const handleZipcodeChange = (newZipcode: string) => {
    setZipcode(newZipcode);
    setValue("zipcode", newZipcode);
  };

  const [neighborhoodSelected, setNeighborhoodSelected] = useState<string>(
    INITIAL_STATE_SELECT_NEIGHBORHOOD,
  );
  const handleNeighborhoodChange = (newNeighborhood: string) => {
    setNeighborhoodSelected(newNeighborhood);
    setValue("neighborhood", newNeighborhood);
    clearErrors("neighborhood");
  };

  const [stateSelected, setStateSelected] = useState<string>(
    INITIAL_STATE_SELECT_STATE,
  );
  const handleStateChange = (newState: string) => {
    setStateSelected(newState);
    setValue("state", newState);
  };

  const [citySelected, setCitySelected] = useState<string>(
    INITIAL_STATE_SELECT_CITY,
  );
  const [cityError, setCityError] = useState<string>("");

  return {
    zipcode,
    setZipcode: handleZipcodeChange,
    neighborhoodSelected,
    setNeighborhoodSelected: handleNeighborhoodChange,
    stateSelected,
    setStateSelected: handleStateChange,
    citySelected,
    setCitySelected,
    cityError,
    setCityError,
  };
};
