import { useState } from "react";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "../constants/addresses.constants";
import { UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import {
  CreateAddressFormValues,
  CreateAddressPayload,
} from "../types/addresses.types";

interface UseAutocompleteZipcodeProps {
  formData: CreateAddressPayload;
  setValue: UseFormSetValue<CreateAddressFormValues>;
  clearErrors: UseFormClearErrors<CreateAddressFormValues>;
}

/**
 * This custom hook is to be used with the component `AutocompleteZipcode`
 */
export const useAutocompleteZipcode = ({
  formData,
  setValue,
  clearErrors,
}: UseAutocompleteZipcodeProps) => {
  const [zipcode, setZipcode] = useState<string>(formData?.zipcode ?? "");
  const handleZipcodeChange = (newZipcode: string) => {
    setZipcode(newZipcode);
    setValue("zipcode", newZipcode);
  };

  const [neighborhoodSelected, setNeighborhoodSelected] = useState<string>(
    formData?.neighborhood ?? INITIAL_STATE_SELECT_NEIGHBORHOOD,
  );
  const handleNeighborhoodChange = (newNeighborhood: string) => {
    setNeighborhoodSelected(newNeighborhood);
    setValue("neighborhood", newNeighborhood);
    clearErrors("neighborhood");
  };

  const [stateSelected, setStateSelected] = useState<string>(
    formData?.state ?? INITIAL_STATE_SELECT_STATE,
  );
  const handleStateChange = (newState: string) => {
    setStateSelected(newState);
    setValue("state", newState);
    clearErrors("state");
  };

  const [citySelected, setCitySelected] = useState<string>(
    formData?.city?.[0] ?? INITIAL_STATE_SELECT_CITY,
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
