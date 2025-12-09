import { object, ObjectSchema, string } from "yup";

const onlyNumberRegex = /^\d+$/;

export type Address = {
  addressName: string;
  externalNumber: string;
  internalNumber: string;
  reference: string;
  zipcode: string;
  state: string;
  city: string[]
  town: string[]
  alias: string;
  neighborhood: string;
}

export interface UpdateAddressInfoPayload {
  newAddress: Address;
  town: string;
  city: string;
}

export type CreateAddressFormValues = {
  street1: string;
  externalNumber: string;
  internalNumber?: string | null | undefined;
  neighborhood: string;
  zipcode: string;
  state: string;
  reference?: string | null | undefined;
  alias: string;
}

export type CreateAddressPayload = Omit<CreateAddressFormValues, 'internalNumber' | 'reference' | 'street1'> & {
  internalNumber: string;
  reference: string;
  city: string[];
  town: string[];
  addressName: string;
}

export type DeleteAddressPayload = {
  alias: string;
}

export interface CreateAddressResponse {
  data: {
    address: Address
  }
  error: null;
  message: null;
  success: boolean;
  version: string;
}

export interface GetAddressesResponse {
  data: {
    addresses: Address[]
  }
  error: null;
  message: null;
  success: boolean;
  version: string;
}

export interface AddressAliasResponse {
  data: {
    address: {
      alias: string;
    }
  }
  error: null;
  message: null;
  success: boolean;
  version: string;
}

export const CreateAddressFormSchema: ObjectSchema<CreateAddressFormValues> = object().shape({
  street1: string().required('La calle es requerida').min(2, 'La calle debe tener al menos 2 caracteres'),
  externalNumber: string()
    .required('El número exterior es requerido')
    .matches(onlyNumberRegex, { excludeEmptyString: true, message: "El número exterior solo puede contener dígitos" })
    .min(1, 'El número exterior debe ser al menos de 1 dígito'),
  internalNumber: string()
    .nullable()
    .notRequired()
    .when('internalNumber', {
      is: (value: string) => value?.length,
      then: (rule) => rule
        .matches(onlyNumberRegex, { excludeEmptyString: true, message: "El número interior solo puede contener dígitos" })
        .min(1, 'El número interior debe ser al menos de 1 dígito'),
    }),
  neighborhood: string().required('Colonia es requerida').min(2, 'La colonia debe tener al menos 2 caracteres'),
  zipcode: string()
      .required('El código postal es requerido')
      .matches(onlyNumberRegex, { excludeEmptyString: true, message: "El código postal solo puede contener dígitos" })
      .min(5, 'El código postal debe tener 5 caracteres')
      .max(5, 'El código postal debe tener 5 caracteres'),
  state: string().required('Estado es requerido').min(2, 'El estado debe tener al menos 2 caracteres'),
  reference: string()
    .nullable()
    .notRequired()
    .when('reference', {
      is: (value: string) => value?.length,
      then: (rule) => rule
        .min(1, 'La referencia debe tener al menos 1 carácter'),
    }),
  alias: string().required('Alias es requerido').min(2, 'El alias debe tener al menos 2 caracteres'),
}, [
  ["internalNumber", "internalNumber"],
  ["reference", "reference"]
])