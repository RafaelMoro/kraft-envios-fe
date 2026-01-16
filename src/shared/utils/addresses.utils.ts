import axios, { AxiosResponse } from "axios";
import { Address, AddressAliasResponse, CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse, DeleteAddressPayload, GetAddressesResponse } from "../types/addresses.types";
import { ADDRESS_API_ENDPOINT, ADDRESS_GE_API_ENDPOINT } from "../constants/global.constants";
import { AddressExtraInfoGE, CreateAddressGEPayload, DeleteGEAdressResponse } from "../types/guides.types";
import { addToLocalStorage, getLocalStorageInfo } from "./local-storage.utils";
import { PENDING_GE_ADDRESSES_KEY } from "../constants/local-storage.constants";

export const formatPayloadCreateAddress = ({
  payload, cities, towns, isGEAddress = false
}: {
  payload: CreateAddressFormValues,
  cities: string[],
  towns: string[],
  isGEAddress?: boolean
}): CreateAddressPayload => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { street1, ...rest } = payload
  return {
    ...rest,
    internalNumber: payload.internalNumber ?? '',
    reference: payload.reference ?? '',
    city: cities,
    town: towns,
    addressName: payload.street1,
    isGEAddress
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

export const editAddressCb = async (data: CreateAddressPayload) => {
  try {
    const res: AxiosResponse<AddressAliasResponse>  = await axios.put(ADDRESS_API_ENDPOINT, data)
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

export const deleteGEAddressCb = async (geAddressId: string) => {
  try {
    const uri = `${ADDRESS_GE_API_ENDPOINT}?addressId=${geAddressId}`
    const res: AxiosResponse<DeleteGEAdressResponse>  = await axios.delete(uri)
    return res?.data
  } catch (error) {
    throw error
  }
}

export const saveAddressToLocalStorage = async (payload: CreateAddressGEPayload ) => {
  try {
    const localStorage = getLocalStorageInfo();
    const pendingGEAddresses = localStorage[PENDING_GE_ADDRESSES_KEY] || [];
    const newPendingGEAddresses = [...pendingGEAddresses, payload];
    addToLocalStorage({ prop: PENDING_GE_ADDRESSES_KEY, newInfo: newPendingGEAddresses })
  } catch (error) {
    console.error('Error saving address to local storage:', error);
  }
}

export const getAddressesGELocalStorage = async () => {
  try {
    const localStorage = getLocalStorageInfo();
    const pendingGEAddresses = localStorage[PENDING_GE_ADDRESSES_KEY]
    if (!pendingGEAddresses) {
      return null
    }
    return pendingGEAddresses as CreateAddressGEPayload[]
  } catch (error) {
    console.error('Error getting address from local storage:', error);
  }
}

export const removeAddressFromLocalStorage = async (alias: string) => {
  try {
    const localStorage = getLocalStorageInfo();
    const pendingGEAddresses = localStorage[PENDING_GE_ADDRESSES_KEY] || [];
    const updatedAddresses = pendingGEAddresses.filter((address: CreateAddressGEPayload) => address.alias !== alias);
    addToLocalStorage({ prop: PENDING_GE_ADDRESSES_KEY, newInfo: updatedAddresses })
  } catch (error) {
    console.error('Error removing address from local storage:', error);
  }
}

export const formatAddressForDisplay = (information: AddressExtraInfoGE): string => {
  const addressNumberInfo = information?.internalNumber ? `${information.externalNumber}, ${information.internalNumber}` : `${information.externalNumber}`;
  return `${information.addressName} ${addressNumberInfo}, ${information.neighborhood}, ${information.city} ${information.state}, C.P. ${information.zipcode}`;
}