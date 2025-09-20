import axios from 'axios'
import { GET_SAT_PRODUCT_ENDPOINT } from '../constants/guides.constants'
import { GetProductSatIdPayload } from '../types/guides.types'

export const getProductSatInfo = async (data: GetProductSatIdPayload) => {
  const res = await axios.post(GET_SAT_PRODUCT_ENDPOINT, data)
  return res
}