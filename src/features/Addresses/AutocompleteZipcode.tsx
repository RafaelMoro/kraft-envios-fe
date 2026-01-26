import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "@/shared/constants/addresses.constants";
import {
  onlyNumberRegex,
  CreateAddressPayload,
} from "@/shared/types/addresses.types";
import {
  getAddressByZipcode,
  selectAddressValue,
} from "@/shared/utils/addresses.utils";
import { NeighborhoodDropdown } from "../AutocompleteZipcode/NeighborhoodDropdown";
import { CountryStateDropdown } from "../AutocompleteZipcode/CountryStateDropdown";
import { AutocompleteZipcodeInput } from "../AutocompleteZipcode/AutocompleteZipcodeInput";
import { CityDropdown } from "../AutocompleteZipcode/CityDropdown";

interface AutocompleteZipcodeProps {
  formData: CreateAddressPayload;
  zipcode: string;
  setZipcode: (newZipcode: string) => void;
  zipcodeError: string;
  setZipcodeError: (error: string) => void;
  neighborhood: string;
  setNeighborhood: (newNeighborhood: string) => void;
  neighborhoodError: string;
  state: string;
  setState: (newState: string) => void;
  stateError: string;
  city: string;
  setCity: (newCity: string) => void;
  cityError: string;
  hideCityField?: boolean;
}

/**
 * This component autocompletes neighborhood, state, and cities with zipcode
 */
export const AutocompleteZipcode = ({
  hideCityField,
  zipcode,
  zipcodeError,
  neighborhoodError,
  stateError,
  cityError,
  neighborhood,
  state,
  city,
  setZipcodeError,
  setNeighborhood,
  setState,
  setCity,
  setZipcode,
  formData,
}: AutocompleteZipcodeProps) => {
  const [debouncedZipcode, setDebouncedZipcode] = useState<string>("");

  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  // Ref to track previous neighborhoods data
  const prevNeighborhoodsDataRef = useRef<string | null>(null);

  // Debounce zipcode to avoid firing queries back to back
  useEffect(() => {
    if (zipcode.length === 5 && onlyNumberRegex.test(zipcode)) {
      const timeoutId = setTimeout(() => {
        setDebouncedZipcode(zipcode);
      }, 2000);

      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedZipcode("");
    }
  }, [zipcode]);

  const { data, isFetching } = useQuery({
    queryKey: ["getAddressByZipcode", debouncedZipcode],
    queryFn: () => getAddressByZipcode(debouncedZipcode),
    enabled:
      debouncedZipcode.length === 5 && onlyNumberRegex.test(debouncedZipcode),
  });

  /**
   * Effect to update neighborhoods, cities and states when data changes
   * It also sets the selected neighborhood, city and state if there's only one option
   */
  useEffect(() => {
    if (data?.neighborhoods) {
      // Create a stringified version of the neighborhoods data to compare
      const currentDataString = JSON.stringify(data.neighborhoods);

      // Only process if the data has actually changed
      if (prevNeighborhoodsDataRef.current === currentDataString) {
        return;
      }

      // Update the ref with current data
      prevNeighborhoodsDataRef.current = currentDataString;

      const onlyNeighborhoods = data.neighborhoods.map(
        (item) => item.neighborhood,
      );
      const onlyCities = data.neighborhoods.map((item) => item.city);
      const onlyStates = data.neighborhoods.map((item) => item.state);
      const newNeighborhoods = Array.from(new Set(onlyNeighborhoods));
      const newCities = Array.from(new Set(onlyCities));
      const newStates = Array.from(new Set(onlyStates));

      setNeighborhoods(newNeighborhoods);
      setCities(newCities);
      setStates(newStates);

      // Check if formData has existing values to preserve
      const hasExistingFormData = Boolean(
        formData?.zipcode &&
        formData?.neighborhood &&
        formData?.state &&
        formData?.city,
      );

      // Set selected values based on formData or auto-select single options
      setNeighborhood(
        selectAddressValue(
          formData?.neighborhood,
          newNeighborhoods,
          INITIAL_STATE_SELECT_NEIGHBORHOOD,
          hasExistingFormData,
        ),
      );
      setState(
        selectAddressValue(
          formData?.state,
          newStates,
          INITIAL_STATE_SELECT_STATE,
          hasExistingFormData,
        ),
      );
      setCity(
        selectAddressValue(
          formData?.city,
          newCities,
          INITIAL_STATE_SELECT_CITY,
          hasExistingFormData,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setState, setCity]);

  return (
    <>
      <AutocompleteZipcodeInput
        zipcode={zipcode}
        zipcodeError={zipcodeError}
        setZipcode={setZipcode}
        setZipcodeError={setZipcodeError}
      />
      <NeighborhoodDropdown
        isFetching={isFetching}
        neighborhood={neighborhood}
        neighborhoods={neighborhoods}
        neighborhoodError={neighborhoodError}
        setNeighborhood={setNeighborhood}
      />
      <CountryStateDropdown
        isFetching={isFetching}
        state={state}
        states={states}
        stateError={stateError}
        setState={setState}
      />
      {!hideCityField && (
        <CityDropdown
          isFetching={isFetching}
          city={city}
          cities={cities}
          cityError={cityError}
          setCity={setCity}
        />
      )}
    </>
  );
};
