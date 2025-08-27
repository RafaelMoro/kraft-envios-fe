import axios from 'axios'
import { MARGIN_PROFIT_API_ENDPOINT } from '../constants/global.constants'
import { ProfitMargin, UpdateMarginProfitPayload } from '../types/margin-profit.types'

export const getMarginProfitCb = async (): Promise<ProfitMargin | null> => {
  const res = await axios.get(MARGIN_PROFIT_API_ENDPOINT)
  // API shape: res.data -> GetMarginProfitData
  // GetMarginProfitData.data.profitMargin is the array we need
  const profit: ProfitMargin = res.data?.data?.data?.profitMargin
  return profit ?? null
}

export const updateMarginProfitCb = async (data: UpdateMarginProfitPayload) => {
  const res =  await axios.post(MARGIN_PROFIT_API_ENDPOINT, data)
  const profit: ProfitMargin = res.data?.data?.data?.profitMargin
  return profit ?? null
}