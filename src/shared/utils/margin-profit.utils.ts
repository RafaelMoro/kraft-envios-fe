import axios from 'axios'
import { GET_MARGIN_PROFIT } from '../constants/global.constants'
import { ProfitMargin } from '../types/margin-profit.types'

export const getMarginProfitCb = async (): Promise<ProfitMargin | null> => {
  const res = await axios.get(GET_MARGIN_PROFIT)
  // API shape: res.data -> GetMarginProfitData
  // GetMarginProfitData.data.profitMargin is the array we need
  const profit: ProfitMargin = res.data?.data?.data?.profitMargin
  return profit ?? null
}