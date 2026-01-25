import { useEffect, useState } from "react";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "../constants/addresses.constants";
import { Path, UseFormClearErrors, UseFormSetValue } from "react-hook-form";

interface UseAutocompleteZipcodeProps<T extends Record<string, unknown>> {
  formData?: {
    zipcode?: string;
    neighborhood?: string;
    state?: string;
    city?: string[] | string;
  };
  setValue: UseFormSetValue<T>;
  clearErrors: UseFormClearErrors<T>;
}

/**
 * This custom hook is to be used with the component `AutocompleteZipcode`
 * Generic hook that can work with any form type containing address fields
 */
export const useAutocompleteZipcode = <T extends Record<string, unknown>>({
  formData,
  setValue,
  clearErrors,
}: UseAutocompleteZipcodeProps<T>) => {
  const [zipcode, setZipcode] = useState<string>("");
  const handleZipcodeChange = (newZipcode: string) => {
    setZipcode(newZipcode);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("zipcode" as Path<T>, newZipcode as any);
  };

  useEffect(() => {
    if (formData?.zipcode) {
      setZipcode(formData.zipcode);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue("zipcode" as Path<T>, formData.zipcode as any);
    }
  }, [formData?.zipcode, setValue]);

  const [neighborhoodSelected, setNeighborhoodSelected] = useState<string>(
    formData?.neighborhood ?? INITIAL_STATE_SELECT_NEIGHBORHOOD,
  );
  const handleNeighborhoodChange = (newNeighborhood: string) => {
    setNeighborhoodSelected(newNeighborhood);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("neighborhood" as Path<T>, newNeighborhood as any);
    clearErrors("neighborhood" as Path<T>);
  };

  const [stateSelected, setStateSelected] = useState<string>(
    formData?.state ?? INITIAL_STATE_SELECT_STATE,
  );
  const handleStateChange = (newState: string) => {
    setStateSelected(newState);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("state" as Path<T>, newState as any);
    clearErrors("state" as Path<T>);
  };

  const [citySelected, setCitySelected] = useState<string>(
    Array.isArray(formData?.city)
      ? formData?.city[0] ?? INITIAL_STATE_SELECT_CITY
      : formData?.city ?? INITIAL_STATE_SELECT_CITY,
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
