import { useState, useEffect } from "react";
import { Label, TextInput } from "flowbite-react";
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
  cities: string[];
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
  cities,
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

  const { data } = useQuery({
    queryKey: ["getAddressByZipcode", debouncedZipcode],
    queryFn: () => getAddressByZipcode(debouncedZipcode),
    enabled:
      debouncedZipcode.length === 5 && onlyNumberRegex.test(debouncedZipcode),
  });

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
  console.log("data", data);

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
      <div>
        <div className="mb-2 block">
          <Label htmlFor="neighborhood">Colonia</Label>
        </div>
        <TextInput
          data-testid="neighborhood"
          id="neighborhood"
          defaultValue={addressData.neighborhood}
          type="text"
        />
        {neighborhoodError?.message && (
          <ErrorMessage>{neighborhoodError?.message}</ErrorMessage>
        )}
      </div>
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
