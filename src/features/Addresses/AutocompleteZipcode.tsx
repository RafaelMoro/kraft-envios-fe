import { Label, TextInput } from "flowbite-react";
import { AddTag } from "@/shared/ui/organisms/AddTag";
import {
  FieldError,
  FieldErrors,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";

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
  register: UseFormRegister<T>;
  addCity: (newCity: string) => void;
  removeCity: (cityToRemove: string) => void;
  setCitiesError: (errorMessage: string) => void;
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
  addCity,
  removeCity,
  citiesError,
  setCitiesError,
}: AutocompleteZipcodeProps<T>) => {
  const zipcodeError = errors?.zipcode as FieldError | undefined;
  const neighborhoodError = errors?.neighborhood as FieldError | undefined;
  const stateError = errors?.state as FieldError | undefined;

  return (
    <>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="zipcode">Código Postal</Label>
        </div>
        <TextInput
          data-testid="zipcode"
          defaultValue={addressData.zipcode}
          id="zipcode"
          type="text"
          inputMode="numeric"
          {...register("zipcode" as Path<T>)}
        />
        {zipcodeError?.message && (
          <ErrorMessage>{zipcodeError?.message}</ErrorMessage>
        )}
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
