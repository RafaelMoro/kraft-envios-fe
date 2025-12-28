import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { Label, TextInput } from "flowbite-react"
import { FieldError, FieldErrors, Path, UseFormRegister } from "react-hook-form";

type PersonalDataT = {
  name: string;
  phone: string;
  lastName: string;
  company?: string | null | undefined;
  email?: string | null | undefined;
}

interface PersonalDataFormProps<T extends PersonalDataT> {
  addressData: T;
  hideCompanyField?: boolean;
  errors: FieldErrors<T>;
  register: UseFormRegister<T>
}

/**
 * This component is used with Pkk, Mn and Tone
 */
export const PersonalDataForm = <T extends PersonalDataT>({ addressData, errors, register, hideCompanyField = false }: PersonalDataFormProps<T>) => {
  const nameError = errors?.name as FieldError | undefined;
  const lastNameError = errors?.lastName as FieldError | undefined;
  const phoneError = errors?.phone as FieldError | undefined;
  const emailError = errors?.email as FieldError | undefined;
  const companyError = errors?.company as FieldError | undefined;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name">Nombre</Label>
        </div>
        <TextInput
          data-testid="name"
          defaultValue={addressData.name}
          id="name"
          type="text"
          {...register("name" as Path<T>)}
        />
        { nameError?.message && (
          <ErrorMessage>{nameError.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="lastName">Apellido</Label>
        </div>
        <TextInput
          data-testid="lastName"
          defaultValue={addressData.lastName}
          id="lastName"
          type="text"
          {...register("lastName" as Path<T>)}
        />
        { lastNameError?.message && (
          <ErrorMessage>{lastNameError.message}</ErrorMessage>
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
          inputMode="numeric"
          defaultValue={addressData.phone}
          {...register("phone" as Path<T>)}
        />
        { phoneError?.message && (
          <ErrorMessage>{phoneError.message}</ErrorMessage>
        )}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email">Correo electrónico (Opcional)</Label>
        </div>
        <TextInput
          id="email"
          type="email"
          data-testid="email"
          defaultValue={addressData.email ?? ''}
          {...register("email" as Path<T>)}
        />
        { emailError?.message && (
          <ErrorMessage>{emailError.message}</ErrorMessage>
        )}
      </div>
      { !hideCompanyField && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="company">Nombre de la compañia (Opcional)</Label>
          </div>
          <TextInput
            data-testid="company"
            defaultValue={addressData.company ?? ''}
            id="company"
            type="text"
            {...register("company" as Path<T>)}
          />
          { companyError?.message && (
            <ErrorMessage>{companyError.message}</ErrorMessage>
          )}
        </div>
      )}
    </section>
  )
}