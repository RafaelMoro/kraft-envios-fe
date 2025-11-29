import axios, { AxiosResponse } from "axios";
import { CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse } from "../types/addresses.types";
import { ADDRESS_API_ENDPOINT } from "../constants/global.constants";

export const formatPayloadCreateAddress = (payload: CreateAddressFormValues): CreateAddressPayload => {
  return {
    ...payload,
    internalNumber: payload.internalNumber ?? '',
    reference: payload.reference ?? '',
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