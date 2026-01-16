import { CreateAddressPayload } from "../types/addresses.types";

export const initialStateAddressForm: CreateAddressPayload = {
  addressName: '',
  externalNumber: '',
  internalNumber: '',
  neighborhood: '',
  zipcode: '',
  state: '',
  city: [],
  town: [],
  reference: '',
  alias: '',
  isGEAddress: false,
}