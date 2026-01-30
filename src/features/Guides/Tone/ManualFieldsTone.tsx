import { Label, TextInput } from "flowbite-react"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { CreateGuideAddressFormValuesTone } from "@/shared/types/guides.types"
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface ManualFieldsToneProps {
  addressData: CreateGuideAddressFormValuesTone
  errors: FieldErrors<CreateGuideAddressFormValuesTone>;
  register: UseFormRegister<CreateGuideAddressFormValuesTone>
}

export const ManualFieldsTone = ({ addressData, errors, register }: ManualFieldsToneProps) => {
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