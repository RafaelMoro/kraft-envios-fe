import { CreateAddressFormValues, CreateAddressPayload } from "../types/addresses.types";

export const formatPayloadCreateAddress = (payload: CreateAddressFormValues): CreateAddressPayload => {
  return {
    ...payload,
    internalNumber: payload.internalNumber ?? '',
    reference: payload.reference ?? '',
  }
}