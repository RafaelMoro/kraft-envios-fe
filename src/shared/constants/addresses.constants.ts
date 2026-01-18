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

export const ZIPCODE_LENGTH_ERROR = "El código postal debe tener 5 caracteres";
export const ZIPCODE_ONLY_NUMBERS_ERROR =
  "El código postal solo puede contener dígitos";
