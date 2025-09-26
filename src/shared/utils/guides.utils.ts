import axios from 'axios'
import { CREATE_GUIDE_MN_ENDPOINT, GET_SAT_PRODUCT_ENDPOINT } from '../constants/guides.constants'
import { CreateGuideMnPayload, GetProductSatIdPayload } from '../types/guides.types'

export const getProductSatInfo = async (data: GetProductSatIdPayload) => {
  const res = await axios.post(GET_SAT_PRODUCT_ENDPOINT, data)
  return res
}

export const createGuideMnCb = async (data: CreateGuideMnPayload) => {
  const res = await axios.post(CREATE_GUIDE_MN_ENDPOINT, data)
  return res
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