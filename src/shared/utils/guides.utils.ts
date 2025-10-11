import axios, { AxiosResponse } from 'axios'
import { CREATE_GUIDE_MN_ENDPOINT, CREATE_GUIDE_MN_ENDPOINT_TONE, GET_SAT_PRODUCT_ENDPOINT } from '../constants/guides.constants'
import { CreateGuideMnPayload, CreateGuideTonePayload, CreateMnGuideResponse, FetchSatProductsResponse, GetProductSatIdPayload } from '../types/guides.types'

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
  const res: AxiosResponse<CreateMnGuideResponse>  = await axios.post(CREATE_GUIDE_MN_ENDPOINT_TONE, data)
  return res?.data?.data?.guide
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