import { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { FieldError, FieldErrors } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { AddTag } from "@/shared/ui/organisms/AddTag";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import {
  ZIPCODE_LENGTH_ERROR,
  ZIPCODE_ONLY_NUMBERS_ERROR,
} from "@/shared/constants/addresses.constants";
import { onlyNumberRegex } from "@/shared/types/addresses.types";
import { getAddressByZipcode } from "@/shared/utils/addresses.utils";

type AddressInformationT = {
  zipcode: string;
  neighborhood: string;
  state: string;
};

interface AutocompleteZipcodeProps<T extends AddressInformationT> {
  addressData: T;
  hideCityField?: boolean;
  errors: FieldErrors<T>;
  citiesError: string;
  zipcode: string;
  addCity: (newCity: string) => void;
  removeCity: (cityToRemove: string) => void;
  setCitiesError: (errorMessage: string) => void;
  setZipcode: (newZipcode: string) => void;
}

/**
 * This component autocompletes neighborhood, state, and cities with zipocode
 */
export const AutocompleteZipcode = <T extends AddressInformationT>({
  addressData,
  hideCityField,
  errors,
  zipcode,
  addCity,
  removeCity,
  citiesError,
  setCitiesError,
  setZipcode,
}: AutocompleteZipcodeProps<T>) => {
  const neighborhoodError = errors?.neighborhood as FieldError | undefined;
  const stateError = errors?.state as FieldError | undefined;

  const [zipcodeError, setZipcodeError] = useState<string>("");
  const [debouncedZipcode, setDebouncedZipcode] = useState<string>("");

  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [neighborhoodSelected, setNeighborhoodSelected] = useState<string>("");

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

  useEffect(() => {
    if (data?.neighborhoods) {
      const onlyNeighborhoods = data.neighborhoods.map(
        (item) => item.neighborhood,
      );
      const onlyCities = data.neighborhoods.map((item) => item.city);
      const onlyStates = data.neighborhoods.map((item) => item.state);

      setNeighborhoods(Array.from(new Set(onlyNeighborhoods)));
      setCities(Array.from(new Set(onlyCities)));
      setStates(Array.from(new Set(onlyStates)));

      // Reset selected neighborhood when zipcode changes
      setNeighborhoodSelected("");
    }
  }, [data]);

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
          <div className="flex flex-col gap-1">
            <Label className="pl-1">Colonia</Label>
            <Button
              className="hover:cursor-pointer flex justify-between"
              data-testid="select-address-dropdown-button"
              color="light"
              disabled={isFetching || neighborhoods.length === 0}
            >
              {isFetching ? <Spinner /> : neighborhoodSelected}
            </Button>
            {neighborhoodError?.message && (
              <ErrorMessage>{neighborhoodError?.message}</ErrorMessage>
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
                onClick={() => setNeighborhoodSelected(item)}
              >
                {item}
              </DropdownItem>
            ))}
        </div>
      </Dropdown>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="state">Estado de la República</Label>
        </div>
        <TextInput
          data-testid="state"
          id="state"
          defaultValue={addressData.state}
          type="text"
        />
        {stateError?.message && (
          <ErrorMessage>{stateError?.message}</ErrorMessage>
        )}
      </div>
      {!hideCityField && (
        <AddTag
          label="cities"
          text="Ciudades"
          tags={cities}
          addTag={addCity}
          removeTag={removeCity}
          placeholder="Presiona enter para agregar ciudades"
          errorMessage={citiesError}
          setError={setCitiesError}
        />
      )}
    </>
  );
};
