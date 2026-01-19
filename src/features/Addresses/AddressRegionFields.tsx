import { Label, TextInput } from "flowbite-react";

/**
 * This component contains the region fields: state, city and neighborhood
 * It's the counterpart of the component `AutocompleteZipcode` that helps the user to fill these fields
 */
export const AddressRegionFields = () => {
  return (
    <>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="zipcode">Código Postal</Label>
        </div>
        <TextInput
          data-testid="zipcode"
          // defaultValue={formData.zipcode}
          id="zipcode"
          type="text"
          inputMode="numeric"
          // {...register("zipcode")}
        />
        {/* {errors?.zipcode?.message && (
          <ErrorMessage>{errors.zipcode?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="neighborhood">Colonia</Label>
        </div>
        <TextInput
          data-testid="neighborhood"
          id="neighborhood"
          // defaultValue={formData.neighborhood}
          type="text"
          // {...register("neighborhood")}
        />
        {/* {errors?.neighborhood?.message && (
          <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="state">Estado de la República</Label>
        </div>
        <TextInput
          data-testid="state"
          id="state"
          // defaultValue={formData.state}
          type="text"
          // {...register("state")}
        />
        {/* {errors?.state?.message && (
          <ErrorMessage>{errors.state?.message}</ErrorMessage>
        )} */}
      </div>
    </>
  );
};
