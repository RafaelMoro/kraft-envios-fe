import { Label, TextInput } from "flowbite-react"
import { FieldError, FieldErrors, Path, UseFormRegister } from "react-hook-form";

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { AddressGE } from "@/shared/types/guides.types";
import { DEFAULT_COMPANY_NAME, DEFAULT_EMAIL_VALUE, DEFAULT_RFC_VALUE } from "@/shared/constants/addresses.constants";

type PersonalDataGET = {
  name: string;
  phone: string;
  email?: string | null | undefined
  company?: string | null | undefined
  rfc?: string | null | undefined
}

interface PersonalInfoAddressGESubformProps<T extends PersonalDataGET> {
  errors: FieldErrors<T>;
  addressToEditGE: AddressGE | null
  register: UseFormRegister<T>
}

export const PersonalInfoAddressGESubform = <T extends PersonalDataGET>({
  errors, register, addressToEditGE
}: PersonalInfoAddressGESubformProps<T>) => {
  const nameError = errors?.name as FieldError | undefined;
  const phoneError = errors?.phone as FieldError | undefined;
  const emailError = errors?.email as FieldError | undefined;
  const companyError = errors?.company as FieldError | undefined;
  const rfcError = errors?.rfc as FieldError | undefined;

  const defaultRFC = addressToEditGE?.rfc === DEFAULT_RFC_VALUE ? '' : addressToEditGE?.rfc ?? ''
  const defaultEmail = addressToEditGE?.email === DEFAULT_EMAIL_VALUE ? '' : addressToEditGE?.email ?? ''
  const defaultCompany = addressToEditGE?.company === DEFAULT_COMPANY_NAME ? '' : addressToEditGE?.company ?? ''

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name">Nombre</Label>
        </div>
        <TextInput
          data-testid="name"
          id="name"
          type="text"
          defaultValue={addressToEditGE?.name ?? ""}
          {...register("name" as Path<T>)}
        />
        { nameError?.message && (
          <ErrorMessage>{nameError?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="phone">Teléfono</Label>
        </div>
        <TextInput
          data-testid="phone"
          id="phone"
          type="text"
          defaultValue={addressToEditGE?.phone ?? ""}
          inputMode="numeric"
          {...register("phone" as Path<T>)}
        />
        { phoneError?.message && (
          <ErrorMessage>{phoneError?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email">Correo electrónico (Opcional)</Label>
        </div>
        <TextInput
          id="email"
          type="email"
          defaultValue={defaultEmail}
          {...register("email" as Path<T>)}
        />
        { emailError?.message && (
          <ErrorMessage>{emailError?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="company">Nombre de la compañia (Opcional)</Label>
        </div>
        <TextInput
          data-testid="company"
          id="company"
          type="text"
          defaultValue={defaultCompany}
          {...register("company" as Path<T>)}
        />
        { companyError?.message && (
          <ErrorMessage>{companyError?.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="rfc">RFC (Opcional)</Label>
        </div>
        <TextInput
          data-testid="rfc"
          id="rfc"
          type="text"
          defaultValue={defaultRFC}
          {...register("rfc" as Path<T>)}
        />
        { rfcError?.message && (
          <ErrorMessage>{rfcError?.message}</ErrorMessage>
        )}
      </div>
    </section>
  )
}