import { CreateAddressFormValues } from "../types/addresses.types";

export const initialStateAddressForm: CreateAddressFormValues = {
  street1: '',
  externalNumber: '',
  internalNumber: '',
  neighborhood: '',
  zipcode: '',
  state: '',
  reference: '',
  alias: '',
}