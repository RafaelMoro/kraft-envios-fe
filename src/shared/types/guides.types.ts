import { object, ObjectSchema, string, number } from "yup";
import { emailOptionalValidation } from "./login.types";

export type GetProductSatIdPayload = {
  search: string
}

export type CreateGuideFormValues = {
  originAddress: CreateGuideAddressFormValues;
  destinationAddress: CreateGuideAddressFormValues;
  parcelInfo: ParcelInfoFormValues;
}

export type CreateGuideFormValuesTone = {
  originAddress: CreateGuideAddressFormValuesTone;
  destinationAddress: CreateGuideAddressFormValuesTone;
  parcelInfo: ParcelInfoFormValuesTone;
}

export type CreateGuideAddressFormValues = {
  name: string;
  street1: string;
  neighborhood: string;
  external_number: string;
  city: string;
  company?: string | null | undefined
  state: string;
  phone: string;
  email?: string | null | undefined
  reference?: string | null | undefined
}

export type CreateGuideAddressFormValuesTone = {
  name: string;
  lastName: string;
  street1: string;
  neighborhood: string;
  town: string;
  external_number: string;
  state: string;
  phone: string;
  email?: string | null | undefined
  reference?: string | null | undefined
}


export type ParcelInfoFormValues = {
  content: string;
  value: number;
  quantity: number;
}

export type ParcelInfoFormValuesTone = {
  content: string;
}

export type CreateGuideMnPayload = {
  quoteId: string
  origin: CreateGuideAddressFormValues & { country: string };
  destination: CreateGuideAddressFormValues & { country: string };
  parcel: ParcelInfoFormValues & { satProductId: string };
}

//#region Responses

/**
 * This interface represents the structure of a product returned by the SAT API.
 */
export interface SatProduct {
  code: string;
  created_at: string;
  description: string;
  id: string;
  similar_words: null | string;
  updated_at: string;
}

/**
 * This interface is the formatted data to be used in the dropdown
 */
export interface SearchProduct {
  code: string;
  description: string
}

/**
 * This interface represents the structure of the response from the SAT API when fetching products.
 */
export interface GetProductId {
  data: SatProduct[]
  meta: {
    authors: string[]
    copyright: string
  }
}

/**
 * This interface represents the structure of the response from our API when fetching SAT products.
 */
export interface FetchSatProductsResponse {
  message: string | null
  products: SearchProduct[]
}

export interface GlobalCreateGuideResponse {
  trackingNumber: string;
  carrier: string;
  price: string;
  guideLink: string | null;
  labelUrl: string | null;
  file: string | null;
}

export interface CreateMnGuideResponse {
  data: {
    guide: GlobalCreateGuideResponse
  }
  error: null;
  message: null;
  messages: string[]
  success: boolean;
  version: string;
}

//#region Schemas

export const CreateGuideAddressFormSchema: ObjectSchema<CreateGuideAddressFormValues> = object().shape({
  name: string().required('Nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  street1: string().required('Calle es requerida').min(2, 'La calle debe tener al menos 2 caracteres'),
  neighborhood: string().required('Colonia es requerida').min(2, 'La colonia debe tener al menos 2 caracteres'),
  external_number: string().required('Número exterior es requerido').matches(/^\d+$/, { excludeEmptyString: true, message: "El número exterior solo puede contener dígitos" }).min(1, 'El número exterior debe tener al menos 1 carácter'),
  city: string().required('Ciudad es requerida').min(2, 'La ciudad debe tener al menos 2 caracteres'),
  company: string()
    .nullable()
    .notRequired()
    .when('company', {
      is: (value: string) => value?.length,
      then: (rule) => rule.min(2, 'El nombre de la compañía debe tener al menos 2 caracteres'),
    }),
  state: string().required('Estado es requerido').min(2, 'El estado debe tener al menos 2 caracteres'),
  phone: string()
    .required('El teléfono es requerido')
    .matches(/^\d+$/, { excludeEmptyString: true, message: "El teléfono solo puede contener dígitos" })
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos'),
  email: emailOptionalValidation,
  reference: string()
    .nullable()
    .notRequired()
    .when('reference', {
      is: (value: string) => value?.length,
      then: (rule) => rule.min(2, 'La referencia del domicilio debe tener al menos 2 caracteres'),
    }),
}, [
  ["company", "company"],
  ["reference", "reference"],
  ["email", "email"]
])

export const ParcelInfoFormValuesFormSchema: ObjectSchema<ParcelInfoFormValues> = object({
  content: string().required('Contenido es requerido').min(2, 'El contenido debe tener al menos 2 caracteres'),
  value: number().typeError('Valor es requerido').required('Valor es requerido').min(1, 'El valor debe ser al menos 1'),
  quantity: number().typeError('Cantidad es requerida').required('Cantidad es requerida').min(1, 'La cantidad debe ser al menos 1'),
})

export const CreateGuideAddressFormSchemaTone: ObjectSchema<CreateGuideAddressFormValuesTone> = object().shape({
  name: string().required('Nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: string().required('Apellido es requerido').min(2, 'El apellido debe tener al menos 2 caracteres'),
  street1: string().required('Calle es requerida').min(2, 'La calle debe tener al menos 2 caracteres'),
  neighborhood: string().required('Colonia es requerida').min(2, 'La colonia debe tener al menos 2 caracteres'),
  external_number: string().required('Número exterior es requerido').matches(/^\d+$/, { excludeEmptyString: true, message: "El número exterior solo puede contener dígitos" }).min(1, 'El número exterior debe tener al menos 1 carácter'),
  town: string().required('Municipio es requerido').min(2, 'El municipio debe tener al menos 2 caracteres'),
  state: string().required('Estado es requerido').min(2, 'El estado debe tener al menos 2 caracteres'),
  phone: string()
    .required('El teléfono es requerido')
    .matches(/^\d+$/, { excludeEmptyString: true, message: "El teléfono solo puede contener dígitos" })
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos'),
  email: emailOptionalValidation,
  reference: string()
    .nullable()
    .notRequired()
    .when('reference', {
      is: (value: string) => value?.length,
      then: (rule) => rule.min(2, 'La referencia del domicilio debe tener al menos 2 caracteres'),
    }),
}, [
  ["reference", "reference"],
  ["email", "email"]
])

export const ParcelInfoFormValuesFormtoneSchema: ObjectSchema<ParcelInfoFormValuesTone> = object({
  content: string().required('Contenido es requerido').min(2, 'El contenido debe tener al menos 2 caracteres')
})