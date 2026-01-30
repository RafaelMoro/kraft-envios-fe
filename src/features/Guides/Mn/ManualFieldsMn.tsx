import { Label, TextInput } from "flowbite-react"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateGuideAddressFormValuesMn } from "@/shared/types/guides.types";

interface ManualFieldsMnProps {
  addressData: CreateGuideAddressFormValuesMn
  errors: FieldErrors<CreateGuideAddressFormValuesMn>;
  register: UseFormRegister<CreateGuideAddressFormValuesMn>
}

export const ManualFieldsMn = ({
  addressData, errors, register
}: ManualFieldsMnProps) => {
  return (
    <>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="neighborhood">Colonia</Label>
        </div>
        <TextInput
          data-testid="neighborhood"
          defaultValue={addressData.neighborhood}
          id="neighborhood"
          type="text"
          {...register("neighborhood")}
        />
        { errors?.neighborhood?.message && (
          <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="city">Ciudad</Label>
        </div>
        <TextInput
          data-testid="city"
          defaultValue={addressData.city}
          id="city"
          type="text"
          {...register("city")}
        />
        { errors?.city?.message && (
          <ErrorMessage>{errors.city?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="state">Estado de la República</Label>
        </div>
        <TextInput
          data-testid="state"
          defaultValue={addressData.state}
          id="state"
          type="text"
          {...register("state")}
        />
        { errors?.state?.message && (
          <ErrorMessage>{errors.state?.message}</ErrorMessage>
        )}
      </div>
    </>
  )
}