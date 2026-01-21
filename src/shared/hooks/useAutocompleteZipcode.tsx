import { useState } from "react";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
} from "../constants/addresses.constants";

/**
 * This custom hook is to be used with the component `AutocompleteZipcode`
 */
export const useAutocompleteZipcode = () => {
  const [zipcode, setZipcode] = useState<string>("");
  const [neighborhoodSelected, setNeighborhoodSelected] = useState<string>(
    INITIAL_STATE_SELECT_NEIGHBORHOOD,
  );
  const [stateSelected, setStateSelected] = useState<string>(
    INITIAL_STATE_SELECT_STATE,
  );
  const [citySelected, setCitySelected] = useState<string>(
    INITIAL_STATE_SELECT_CITY,
  );

  return {
    zipcode,
    setZipcode,
    neighborhoodSelected,
    setNeighborhoodSelected,
    stateSelected,
    setStateSelected,
    citySelected,
    setCitySelected,
  };
};
