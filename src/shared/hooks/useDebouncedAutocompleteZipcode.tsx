import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAddressByZipcode, selectAddressValue } from "../utils/addresses.utils";
import { onlyNumberRegex } from "../types/addresses.types";
import { INITIAL_STATE_SELECT_CITY, INITIAL_STATE_SELECT_NEIGHBORHOOD, INITIAL_STATE_SELECT_STATE } from "../constants/addresses.constants";

interface UseDebouncedAutocompleteZipcodeProps {
  zipcode: string;
  formData?: {
    zipcode?: string;
    neighborhood?: string
    state?: string;
    city?: string[] | string;
  };
  setNeighborhood: (newNeighborhood: string) => void;
  setState: (newState: string) => void;
  setCity: (newCity: string) => void;
  skipInitialZipcodeLookup?: boolean;
  resetCityAndStateOnLookup?: boolean;
}

/**
 * This hook fetches the information related to neighborhoods, states and cities based on a debounced zipcode input
 */
export const useDebouncedAutocompleteZipcode = ({
  zipcode, formData, setNeighborhood, setState, setCity, skipInitialZipcodeLookup = false, resetCityAndStateOnLookup = false,
}: UseDebouncedAutocompleteZipcodeProps) => {
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  const [debouncedZipcode, setDebouncedZipcode] = useState<string>("");

  // Ref to track previous neighborhoods data
  const prevNeighborhoodsDataRef = useRef<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["getAddressByZipcode", debouncedZipcode],
    queryFn: () => getAddressByZipcode(debouncedZipcode),
    enabled:
      debouncedZipcode.length === 5 && onlyNumberRegex.test(debouncedZipcode),
  });

  // Debounce zipcode to avoid firing queries back to back
  useEffect(() => {
    const shouldLookup = !skipInitialZipcodeLookup || zipcode !== formData?.zipcode
    if (shouldLookup && zipcode.length === 5 && onlyNumberRegex.test(zipcode)) {
      const timeoutId = setTimeout(() => {
        setDebouncedZipcode(zipcode);
      }, 2000);

      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedZipcode("");
    }
  }, [formData?.zipcode, skipInitialZipcodeLookup, zipcode]);

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

      const shouldResetCityAndState =
        resetCityAndStateOnLookup && debouncedZipcode !== formData?.zipcode

      // Set selected values based on formData or auto-select single options.
      setNeighborhood(
        selectAddressValue(
          formData?.neighborhood,
          newNeighborhoods,
          INITIAL_STATE_SELECT_NEIGHBORHOOD,
          hasExistingFormData,
        ),
      );
      setState(shouldResetCityAndState
        ? INITIAL_STATE_SELECT_STATE
        : selectAddressValue(formData?.state, newStates, INITIAL_STATE_SELECT_STATE, hasExistingFormData),
      )
      setCity(shouldResetCityAndState
        ? INITIAL_STATE_SELECT_CITY
        : selectAddressValue(formData?.city, newCities, INITIAL_STATE_SELECT_CITY, hasExistingFormData),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setState, setCity]);

  return {
    isFetching,
    neighborhoods,
    cities,
    states,
  }
}
