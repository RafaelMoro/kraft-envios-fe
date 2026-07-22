import axios, { AxiosResponse } from 'axios'

import { BALANCE_API_ENDPOINT } from '@/shared/constants/global.constants'
import { GetBalanceResponse } from '@/shared/types/balance.types'

const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const getBalanceCb = async (): Promise<number> => {
  const response: AxiosResponse<GetBalanceResponse> = await axios.get(BALANCE_API_ENDPOINT)

  return response.data.data.balance.amount
}

export const formatBalanceMxn = (amount: number): string => mxnFormatter.format(amount)
