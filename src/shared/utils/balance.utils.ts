import axios, { AxiosResponse } from 'axios'

import {
  BALANCE_API_ENDPOINT,
  BALANCE_REQUESTS_ADMIN_API_ENDPOINT,
  BALANCE_REQUESTS_API_ENDPOINT
} from '@/shared/constants/global.constants'
import {
  AdminBalanceRequestDto,
  AdminBalanceRequestListData,
  AdminBalanceRequestListParams,
  BalanceDecisionPayload,
  BalanceRequestDto,
  BalanceRequestListData,
  BalanceRequestListParams,
  CancelBalanceRequestResponse,
  CreateBalanceRequestPayload,
  CreateBalanceRequestResponse,
  DecideBalanceRequestResponse,
  GetAdminBalanceRequestsResponse,
  GetBalanceRequestsResponse,
  GetBalanceResponse
} from '@/shared/types/balance.types'

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

export const createBalanceRequestCb = async (
  payload: CreateBalanceRequestPayload
): Promise<BalanceRequestDto> => {
  const response: AxiosResponse<CreateBalanceRequestResponse> = await axios.post(
    BALANCE_API_ENDPOINT,
    payload
  )

  return response.data.data.request
}

export const formatBalanceMxn = (amount: number): string => mxnFormatter.format(amount)

export const getBalanceRequestsCb = async (
  params: BalanceRequestListParams
): Promise<BalanceRequestListData> => {
  const query: BalanceRequestListParams = {}
  if (params.month !== undefined) query.month = params.month
  if (params.year !== undefined) query.year = params.year
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit

  const response: AxiosResponse<GetBalanceRequestsResponse> = await axios.get(
    BALANCE_REQUESTS_API_ENDPOINT,
    { params: query }
  )
  return response.data.data
}

export const cancelBalanceRequestCb = async (requestId: string): Promise<BalanceRequestDto> => {
  const response: AxiosResponse<CancelBalanceRequestResponse> = await axios.patch(
    `${BALANCE_REQUESTS_API_ENDPOINT}/${encodeURIComponent(requestId)}/cancel`
  )
  return response.data.data.request
}

export const getAdminBalanceRequestsCb = async (
  params: AdminBalanceRequestListParams
): Promise<AdminBalanceRequestListData> => {
  const query: AdminBalanceRequestListParams = {}
  if (params.month !== undefined) query.month = params.month
  if (params.year !== undefined) query.year = params.year
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit
  if (params.status !== undefined) query.status = params.status

  const response: AxiosResponse<GetAdminBalanceRequestsResponse> = await axios.get(
    BALANCE_REQUESTS_ADMIN_API_ENDPOINT,
    { params: query }
  )
  return response.data.data
}

export const decideBalanceRequestCb = async ({
  requestId,
  payload
}: {
  requestId: string
  payload: BalanceDecisionPayload
}): Promise<AdminBalanceRequestDto> => {
  const response: AxiosResponse<DecideBalanceRequestResponse> = await axios.patch(
    `${BALANCE_REQUESTS_API_ENDPOINT}/${encodeURIComponent(requestId)}/decision`,
    payload
  )
  return response.data.data.request
}
