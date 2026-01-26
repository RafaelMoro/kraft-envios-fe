import { NeighborhoodDropdown } from "../AutocompleteZipcode/NeighborhoodDropdown";
import { CountryStateDropdown } from "../AutocompleteZipcode/CountryStateDropdown";
import { AutocompleteZipcodeInput } from "../AutocompleteZipcode/AutocompleteZipcodeInput";
import { CityDropdown } from "../AutocompleteZipcode/CityDropdown";
import { useDebouncedAutocompleteZipcode } from "@/shared/hooks/useDebouncedAutocompleteZipcode";

interface AutocompleteZipcodeProps {
  formData?: {
    zipcode?: string;
    neighborhood?: string
    state?: string;
    city?: string[] | string;  
  };
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
 * Errors are managed with react hook forms for state, neighborhood and zipcode
 * City Error can be managed with react state optionally or with react hook forms
 * Use this component with the custom hook `useAutocompleteZipcode`
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
  const {
    isFetching,
    neighborhoods,
    cities,
    states,
  } = useDebouncedAutocompleteZipcode({
    zipcode,
    formData,
    setNeighborhood,
    setState,
    setCity,
  })

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
