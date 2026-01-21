import { useState, useEffect, useRef } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { RiArrowDownSLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import {
  INITIAL_STATE_SELECT_CITY,
  INITIAL_STATE_SELECT_NEIGHBORHOOD,
  INITIAL_STATE_SELECT_STATE,
  ZIPCODE_LENGTH_ERROR,
  ZIPCODE_ONLY_NUMBERS_ERROR,
} from "@/shared/constants/addresses.constants";
import { onlyNumberRegex } from "@/shared/types/addresses.types";
import { getAddressByZipcode } from "@/shared/utils/addresses.utils";

interface AutocompleteZipcodeProps {
  hideCityField?: boolean;
  zipcode: string;
  zipcodeError: string;
  neighborhoodError: string;
  stateError: string;
  neighborhood: string;
  state: string;
  city: string;
  setZipcodeError: (error: string) => void;
  setZipcode: (newZipcode: string) => void;
  setNeighborhood: (newNeighborhood: string) => void;
  setState: (newState: string) => void;
  setCity: (newCity: string) => void;
}

/**
 * This component autocompletes neighborhood, state, and cities with zipocode
 */
export const AutocompleteZipcode = ({
  hideCityField,
  zipcode,
  zipcodeError,
  neighborhoodError,
  stateError,
  neighborhood,
  state,
  city,
  setZipcodeError,
  setNeighborhood,
  setState,
  setCity,
  setZipcode,
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

      const newCurrentNeighborhood =
        newNeighborhoods.length === 1
          ? (newNeighborhoods?.[0] ?? INITIAL_STATE_SELECT_NEIGHBORHOOD)
          : INITIAL_STATE_SELECT_NEIGHBORHOOD;
      const newSelectedState =
        newStates.length === 1
          ? (newStates?.[0] ?? INITIAL_STATE_SELECT_STATE)
          : INITIAL_STATE_SELECT_STATE;
      const newSelectedCity =
        newCities.length === 1
          ? (newCities?.[0] ?? INITIAL_STATE_SELECT_CITY)
          : INITIAL_STATE_SELECT_CITY;

      // Reset selected neighborhood when zipcode changes
      console.log("reseting new neighborhood");
      setNeighborhood(newCurrentNeighborhood);
      setState(newSelectedState);
      setCity(newSelectedCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setState, setCity]);

  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value) {
      setZipcode("");
      return;
    }
    if (!onlyNumberRegex.test(value)) {
      setZipcodeError(ZIPCODE_ONLY_NUMBERS_ERROR);
      // We return here because we don't want to update the zipcode state with invalid value
      return;
    }
    if (value.length < 5 || value.length > 5) {
      setZipcodeError(ZIPCODE_LENGTH_ERROR);
    }
    if (value.length === 5) {
      setZipcodeError("");
    }
    setZipcode(value);
  };

  return (
    <>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="zipcode">Código Postal</Label>
        </div>
        <TextInput
          data-testid="zipcode"
          id="zipcode"
          type="text"
          inputMode="numeric"
          value={zipcode}
          onChange={handleZipcodeChange}
        />
        {zipcodeError && <ErrorMessage>{zipcodeError}</ErrorMessage>}
      </div>
      <Dropdown
        label=""
        renderTrigger={() => (
          <div>
            <div className="mb-2 block">
              <Label htmlFor="neighborhood">Colonia</Label>
            </div>
            <Button
              className="hover:cursor-pointer flex justify-between w-full"
              data-testid="autocomplete-dropdown-neighborhood-button"
              color="light"
              disabled={isFetching || neighborhoods.length === 0}
            >
              {isFetching ? <Spinner /> : neighborhood}
              <RiArrowDownSLine />
            </Button>
            {neighborhoodError && (
              <ErrorMessage>{neighborhoodError}</ErrorMessage>
            )}
          </div>
        )}
      >
        <div className="overflow-y-auto max-h-52">
          {neighborhoods &&
            neighborhoods.length > 0 &&
            neighborhoods.map((item) => (
              <DropdownItem
                key={`neighborhood-${item}`}
                onClick={() => setNeighborhood(item)}
              >
                {item}
              </DropdownItem>
            ))}
        </div>
      </Dropdown>
      <Dropdown
        label=""
        renderTrigger={() => (
          <div>
            <div className="mb-2 block">
              <Label htmlFor="state">Estado de la República</Label>
            </div>
            <Button
              className="hover:cursor-pointer flex justify-between w-full"
              data-testid="autocomplete-dropdown-state-button"
              color="light"
              disabled={isFetching || states.length === 0}
            >
              {isFetching ? <Spinner /> : state}
              <RiArrowDownSLine />
            </Button>
            {stateError && <ErrorMessage>{stateError}</ErrorMessage>}
          </div>
        )}
      >
        <div className="overflow-y-auto max-h-52">
          {states &&
            states.length > 0 &&
            states.map((item) => (
              <DropdownItem
                key={`state-${item}`}
                onClick={() => setState(item)}
              >
                {item}
              </DropdownItem>
            ))}
        </div>
      </Dropdown>
      {!hideCityField && (
        <Dropdown
          label=""
          renderTrigger={() => (
            <div>
              <div className="mb-2 block">
                <Label htmlFor="city">Ciudad</Label>
              </div>
              <Button
                className="hover:cursor-pointer flex justify-between w-full"
                data-testid="autocomplete-dropdown-city-button"
                color="light"
                disabled={isFetching || states.length === 0}
              >
                {isFetching ? <Spinner /> : city}
                <RiArrowDownSLine />
              </Button>
              {stateError && <ErrorMessage>{stateError}</ErrorMessage>}
            </div>
          )}
        >
          <div className="overflow-y-auto max-h-52">
            {cities &&
              cities.length > 0 &&
              cities.map((item) => (
                <DropdownItem
                  key={`city-${item}`}
                  onClick={() => setCity(item)}
                >
                  {item}
                </DropdownItem>
              ))}
          </div>
        </Dropdown>
      )}
    </>
  );
};
