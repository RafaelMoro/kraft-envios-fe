import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { Label, TextInput } from "flowbite-react"
import { FieldErrors, UseFormRegister, FieldError, Path } from "react-hook-form"

type PersonalData = {
  name: string;
  phone: string;
  lastName: string;
  email?: string | null | undefined;
}

interface PersonalDataToneProps<T extends PersonalData> {
  addressData: T;
  errors: FieldErrors<T>;
  register: UseFormRegister<T>
}

export const PersonalDataTone = <T extends PersonalData>({ addressData, errors, register }: PersonalDataToneProps<T>) => {
  const nameError = errors?.name as FieldError | undefined;
  const lastNameError = errors?.lastName as FieldError | undefined;
  const phoneError = errors?.phone as FieldError | undefined;
  const emailError = errors?.email as FieldError | undefined;

  return (
    <section>
      <h4 className="text-xl">Datos personales</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            defaultValue={addressData.email ?? ''}
            {...register("email" as Path<T>)}
          />
          { emailError?.message && (
            <ErrorMessage>{emailError.message}</ErrorMessage>
          )}
        </div>
      </div>
    </section>
  )
}