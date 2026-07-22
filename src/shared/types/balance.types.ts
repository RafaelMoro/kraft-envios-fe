export interface BalanceDto {
  amount: number
}

export interface GetBalanceData {
  balance: BalanceDto
}

export interface GetBalanceResponse {
  version: string
  data: GetBalanceData
  message: null
  error: null
}
