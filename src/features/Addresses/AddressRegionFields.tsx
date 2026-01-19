import { ReactNode } from "react";
import { Label, TextInput } from "flowbite-react";
import {
  FieldError,
  FieldErrors,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";

type AddressRegionDataT = {
  zipcode: string;
  neighborhood: string;
  state: string;
};
interface AddressRegionFieldsProps<T extends AddressRegionDataT> {
  CityField: ReactNode;
  addressData: T;
  errors: FieldErrors<T>;
  register: UseFormRegister<T>;
}

/**
 * This component contains the region fields: state, city and neighborhood
 * It's the counterpart of the component `AutocompleteZipcode` that helps the user to fill these fields
 */
export const AddressRegionFields = <T extends AddressRegionDataT>({
  CityField,
  addressData,
  errors,
  register,
}: AddressRegionFieldsProps<T>) => {
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
      {CityField}
    </>
  );
};
