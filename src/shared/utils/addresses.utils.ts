import axios, { AxiosResponse } from "axios";
import { CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse } from "../types/addresses.types";
import { ADDRESS_API_ENDPOINT } from "../constants/global.constants";

export const formatPayloadCreateAddress = (payload: CreateAddressFormValues): CreateAddressPayload => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { street1, ...rest } = payload
  return {
    ...rest,
    internalNumber: payload.internalNumber ?? '',
    reference: payload.reference ?? '',
    city: [payload.city],
    town: [payload.town],
    addressName: payload.street1
  }
}

export const createAddressCb = async (data: CreateAddressPayload) => {
  try {
    const res: AxiosResponse<CreateAddressResponse>  = await axios.post(ADDRESS_API_ENDPOINT, data)
    return res?.data
  } catch (error) {
    throw error
  }
}