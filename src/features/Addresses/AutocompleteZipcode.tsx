import { Label, TextInput } from "flowbite-react";
import { useState } from "react";

import { AddTag } from "@/shared/ui/organisms/AddTag";
import {
  FieldError,
  FieldErrors,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { ADDRESS_MIN_LENGTH_ERROR } from "@/shared/constants/addresses.constants";

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
  register: UseFormRegister<T>;
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
  register,
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

  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length < 5) {
      setZipcodeError(ADDRESS_MIN_LENGTH_ERROR);
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
      <div>
        <div className="mb-2 block">
          <Label htmlFor="neighborhood">Colonia</Label>
        </div>
        <TextInput
          data-testid="neighborhood"
          id="neighborhood"
          defaultValue={addressData.neighborhood}
          type="text"
          {...register("neighborhood" as Path<T>)}
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
          {...register("state" as Path<T>)}
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
