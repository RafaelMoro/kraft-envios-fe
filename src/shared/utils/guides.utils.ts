import axios from 'axios'
import { GET_SAT_PRODUCT_ENDPOINT } from '../constants/guides.constants'

export const getProductSatInfo = async () => {
  const res = await axios.post(GET_SAT_PRODUCT_ENDPOINT)
  return res
}