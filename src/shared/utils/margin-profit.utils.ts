import axios from 'axios'
import { MARGIN_PROFIT_API_ENDPOINT } from '../constants/global.constants'
import { CourierForm, ProfitMargin, ProviderGlobalConfig, UpdateMarginProfitPayload } from '../types/margin-profit.types'

export const getMarginProfitCb = async (): Promise<ProviderGlobalConfig[] | null> => {
  const res = await axios.get(MARGIN_PROFIT_API_ENDPOINT)
  // API shape: res.data -> GetMarginProfitData
  // GetMarginProfitData.data.profitMargin is the array we need
  const providers: ProviderGlobalConfig[] = res.data?.data?.data?.providers ?? []
  return providers ?? null
}

export const updateMarginProfitCb = async (data: UpdateMarginProfitPayload) => {
  const res =  await axios.post(MARGIN_PROFIT_API_ENDPOINT, data)
  const profit: ProfitMargin = res.data?.data?.data?.profitMargin
  return profit ?? null
}

export const hasDuplicateCouriersFn = (courierForms: CourierForm[]) => {
  if (!Array.isArray(courierForms) || courierForms.length <= 1) return false

  const seen = new Set<string>()
  for (const form of courierForms) {
    const key = String(form?.courier)
    if (!key) continue
    if (seen.has(key)) return true
    seen.add(key)
  }

  return false
}