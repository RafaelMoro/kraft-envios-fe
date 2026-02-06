import { CreateAddressPayload } from "../types/addresses.types";

export const initialStateAddressForm: CreateAddressPayload = {
  addressName: "",
  externalNumber: "",
  internalNumber: "",
  neighborhood: "",
  zipcode: "",
  state: "",
  city: [],
  town: [],
  reference: "",
  alias: "",
  isGEAddress: false,
};

export const ZIPCODE_ERROR_EMPTY = 'El código postal es requerido'
export const ZIPCODE_LENGTH_ERROR = "El código postal debe tener 5 caracteres";
export const ZIPCODE_ONLY_NUMBERS_ERROR =
  "El código postal solo puede contener dígitos";
export const ZIPCODE_EMPTY_ERROR = "El código postal es requerido";
export const NEIGHBORHOOD_EMPTY_ERROR = "Colonia es requerida";
export const INITIAL_STATE_SELECT_NEIGHBORHOOD = "Seleccione una colonia";
export const INITIAL_STATE_SELECT_STATE = "Seleccione un estado";
export const INITIAL_STATE_SELECT_CITY = "Seleccione una ciudad";

export const DEFAULT_RFC_VALUE = 'XAXX010101000'
export const DEFAULT_COMPANY_NAME = 'Kraft Envios'
export const DEFAULT_EMAIL_VALUE = process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com'
