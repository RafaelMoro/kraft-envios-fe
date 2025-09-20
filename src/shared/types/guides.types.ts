import { object, ObjectSchema, string } from "yup";
import { emailValidation } from "./login.types";

export type OriginAddressFormValues = {
  name: string;
  street1: string;
  neighborhood: string;
  external_number: string;
  city: string;
  company: string;
  state: string;
  phone: string;
  email: string;
  reference: string
}

//#region Schemas

export const OriginAddressFormSchema: ObjectSchema<OriginAddressFormValues> = object({
  name: string().required('Nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  street1: string().required('Calle es requerida').min(2, 'La calle debe tener al menos 2 caracteres'),
  neighborhood: string().required('Colonia es requerida').min(2, 'La colonia debe tener al menos 2 caracteres'),
  external_number: string().required('Número exterior es requerido').matches(/^\d+$/, { excludeEmptyString: true, message: "El número exterior solo puede contener dígitos" }).min(1, 'El número exterior debe tener al menos 1 carácter'),
  city: string().required('Ciudad es requerida').min(2, 'La ciudad debe tener al menos 2 caracteres'),
  company: string().required('Nombre de la compañía es requerido').min(2, 'El nombre de la compañía debe tener al menos 2 caracteres'),
  state: string().required('Estado es requerido').min(2, 'El estado debe tener al menos 2 caracteres'),
  phone: string()
    .required('El teléfono es requerido')
    .matches(/^\d+$/, { excludeEmptyString: true, message: "El teléfono solo puede contener dígitos" })
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos'),
  email: emailValidation,
  reference: string().required('Referencia del domicilio es requerida').min(2, 'La referencia del domicilio debe tener al menos 2 caracteres'),
})