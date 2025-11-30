import axios, { AxiosResponse } from "axios";
import { Address, AddressAliasResponse, CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse, DeleteAddressPayload, GetAddressesResponse } from "../types/addresses.types";
import { ADDRESS_API_ENDPOINT } from "../constants/global.constants";

export const formatPayloadCreateAddress = ({
  payload, cities, towns
}: { payload: CreateAddressFormValues, cities: string[], towns: string[]}): CreateAddressPayload => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { street1, ...rest } = payload
  return {
    ...rest,
    internalNumber: payload.internalNumber ?? '',
    reference: payload.reference ?? '',
    city: cities,
    town: towns,
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

export const getAddressesCb = async (): Promise<Address[] | null> => {
  try {
    const res: AxiosResponse<GetAddressesResponse> = await axios.get(ADDRESS_API_ENDPOINT)
    return res?.data?.data?.addresses
  } catch (error) {
    throw error
  }
}

export const deleteAddressCb = async (data: DeleteAddressPayload) => {
  try {
    const res: AxiosResponse<AddressAliasResponse>  = await axios.delete(ADDRESS_API_ENDPOINT, {
      data
    })
    return res?.data
  } catch (error) {
    throw error
  }
}