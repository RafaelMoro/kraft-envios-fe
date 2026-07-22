import { object, type ObjectSchema, string } from 'yup'

const BALANCE_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

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

export type BalanceRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface BalanceRequestFormValues {
  amount: string
}

export interface CreateBalanceRequestPayload {
  amount: number
}

export interface BalanceRequestDto {
  id: string
  amount: number
  paymentReference?: string | null
  status: BalanceRequestStatus
  decisionReason: string | null
  decisionAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBalanceRequestResponse {
  version: string
  data: {
    request: BalanceRequestDto
  }
  message: null
  error: null
}

export interface BalanceValidationError {
  statusCode: 400
  message: string[]
  error: 'Bad Request'
}

export interface BalanceDomainError {
  code: string
  message: string
  technicalDetails?: object
}

export interface CreateBalanceRequestErrorResponse {
  version?: string
  data?: null
  message: string | null
  error?: BalanceValidationError | BalanceDomainError | null
}

export const balanceRequestSchema: ObjectSchema<BalanceRequestFormValues> = object({
  amount: string()
    .required('Ingresa el monto a solicitar')
    .transform((value: string | undefined) => value?.trim() ?? '')
    .matches(BALANCE_AMOUNT_PATTERN, 'Ingresa un monto válido con máximo dos decimales')
    .test('min-amount', 'El monto mínimo es 0.01 MXN', (value) => {
      if (!value || !BALANCE_AMOUNT_PATTERN.test(value)) return true

      return Number(value) >= 0.01
    })
    .test('max-amount', 'El monto máximo es 100000.00 MXN', (value) => {
      if (!value || !BALANCE_AMOUNT_PATTERN.test(value)) return true

      return Number(value) <= 100000
    })
})
