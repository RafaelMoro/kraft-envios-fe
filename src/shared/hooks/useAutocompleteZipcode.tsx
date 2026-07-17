import { useEffect, useState } from "react";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "../constants/addresses.constants";
import { Path, UseFormClearErrors, UseFormSetError, UseFormSetValue } from "react-hook-form";
import { zipcodeValidation } from "../types/global.types";

interface UseAutocompleteZipcodeProps<T extends Record<string, unknown>> {
  formData?: {
    zipcode?: string;
    neighborhood?: string;
    state?: string;
    city?: string[] | string;
  };
  syncCityForm?: boolean;
  setValue: UseFormSetValue<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
}

/**
 * This custom hook is to be used with the component `AutocompleteZipcode`
 * The errors and form state are handled with react hook form for state, city, neighborhood and zipcode
 * The error management of city can be handled with react state optionally
 */
export const useAutocompleteZipcode = <T extends Record<string, unknown>>({
  formData,
  syncCityForm = false,
  setValue,
  setError,
  clearErrors,
}: UseAutocompleteZipcodeProps<T>) => {
  const [zipcode, setZipcode] = useState<string>(formData?.zipcode ?? "");
  const [zipcodeError, setZipcodeError] = useState<string>("");
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

  /**
   * It returns boolean whether is valid the neighborhood or not. It also sets the error in react hook form
   */
  const isValidNeighborhood = () => {
    if (neighborhoodSelected === INITIAL_STATE_SELECT_NEIGHBORHOOD || !neighborhoodSelected) {
      setError("neighborhood" as Path<T>, { type: "manual", message: INITIAL_STATE_SELECT_NEIGHBORHOOD });
      return false
    }
    return true
  }

  /**
   * This function only is used if zipcode does not exist in react hook form
   */
  const validateZipcodeErrors = () => {
    try {
      zipcodeValidation.validateSync(zipcode);
      setZipcodeError("");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setZipcodeError(error.message);
      }
      return false;
    }
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
  const handleCityChange = (newCity: string) => {
    if (syncCityForm) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue("city" as Path<T>, newCity as any);
    }
    setCitySelected(newCity);
  }
  const [cityError, setCityError] = useState<string>("");

  return {
    zipcode,
    setZipcode: handleZipcodeChange,
    zipcodeError,
    setZipcodeError,
    validateZipcodeErrors,
    neighborhoodSelected,
    setNeighborhoodSelected: handleNeighborhoodChange,
    isValidNeighborhood,
    stateSelected,
    setStateSelected: handleStateChange,
    citySelected,
    setCitySelected: handleCityChange,
    cityError,
    setCityError,
  };
};
