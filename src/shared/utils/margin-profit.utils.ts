import axios from 'axios'
import { GET_MARGIN_PROFIT } from '../constants/global.constants'

export const getMarginProfitCb = () => {
  return axios.get(GET_MARGIN_PROFIT)
}