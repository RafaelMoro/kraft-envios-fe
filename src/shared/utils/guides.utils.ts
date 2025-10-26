import axios, { AxiosResponse } from 'axios'
import {
  CREATE_GUIDE_MN_ENDPOINT,
  CREATE_GUIDE_TONE_ENDPOINT,
  GET_SAT_PRODUCT_ENDPOINT,
  DEFAULT_COMPANY,
  DEFAULT_EMAIL,
  DEFAULT_REFERENCE,
  CREATE_GUIDE_PKK_ENDPOINT,
  GET_ALIAS_ADDRESSES_GE_ENDPOINT,
  CREATE_ADDRESS_GE_ENDPOINT
} from '../constants/guides.constants'
import {
  CreateGuideMnPayload,
  CreateGuideTonePayload,
  CreateMnGuideResponse,
  FetchSatProductsResponse,
  GetProductSatIdPayload,
  CreateGuideAddressFormValues,
  CreateGuideAddressFormValuesTone,
  CreateGuideAddressValuesPkk,
  CreateGuidePkkPayload,
  CreateAddressGEResponse,
  CreateAddressGEPayload,
} from '../types/guides.types'

export const getProductSatInfo = async (data: GetProductSatIdPayload) => {
  const res: AxiosResponse<FetchSatProductsResponse> = await axios.post(GET_SAT_PRODUCT_ENDPOINT, data)
  return res
}

export const createGuideMnCb = async (data: CreateGuideMnPayload) => {
  const res: AxiosResponse<CreateMnGuideResponse>  = await axios.post(CREATE_GUIDE_MN_ENDPOINT, data)
  console.log('res?.data from cb', res?.data)
  return res?.data?.data?.guide
}

export const createGuideToneCb = async (data: CreateGuideTonePayload) => {
  try {
    const res: AxiosResponse<CreateMnGuideResponse>  = await axios.post(CREATE_GUIDE_TONE_ENDPOINT, data)
    return res?.data?.data?.guide
  } catch (error) {
    throw error
  }
}

export const createGuidePkkCb = async (data: CreateGuidePkkPayload) => {
  try {
    const res: AxiosResponse<CreateMnGuideResponse>  = await axios.post(CREATE_GUIDE_PKK_ENDPOINT, data)
    return res?.data?.data?.guide
  } catch (error) {
    throw error
  }
}

export const getAliasAddressesCb = async (): Promise<string[]> => {
  try {
    const res: AxiosResponse<{ aliases: string[] }> = await axios.get(GET_ALIAS_ADDRESSES_GE_ENDPOINT)
    const aliases = res?.data?.aliases ?? []
    return aliases
  } catch (error) {
    throw error
  }
}

export const createAddressGECb = async (payload: CreateAddressGEPayload) => {
  try {
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.post(CREATE_ADDRESS_GE_ENDPOINT, payload)
    const data = res?.data
    return data
  } catch (error) {
    throw error
  }
}

/**
 * Replace whitespace characters with plus signs in a string.
 * Useful for URL encoding or API query formatting.
 * @param input - The input string to process
 * @returns The string with whitespace replaced by plus signs
 * @example replaceSpacesWithPlus('food and water') => 'food+and+water'
 */
export const replaceSpacesWithPlus = (input: string): string => {
  return input.replace(/\s+/g, '+')
}

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddress = (address: CreateGuideAddressFormValues): CreateGuideAddressFormValues => {
  return {
    ...address,
    company: address.company?.trim() || DEFAULT_COMPANY,
    email: address.email?.trim() || DEFAULT_EMAIL,
    reference: address.reference?.trim() || DEFAULT_REFERENCE
  }
}

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddressTone = (address: CreateGuideAddressFormValuesTone): CreateGuideAddressFormValuesTone => {
  return {
    ...address,
    email: address.email?.trim() || DEFAULT_EMAIL,
    reference: address.reference?.trim() || DEFAULT_REFERENCE
  }
}

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddressPkk = (address: CreateGuideAddressValuesPkk): CreateGuideAddressValuesPkk => {
  return {
    ...address,
    email: address.email?.trim() || DEFAULT_EMAIL,
  }
}