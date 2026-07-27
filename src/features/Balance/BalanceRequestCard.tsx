import { Badge, Button } from 'flowbite-react'

import {
  BALANCE_CANCEL_ACTION,
  BALANCE_DECISION_NONE,
  BALANCE_FIELD_AMOUNT,
  BALANCE_FIELD_CREATED,
  BALANCE_FIELD_DECISION,
  BALANCE_FIELD_DECISION_REASON,
  BALANCE_FIELD_PAYMENT_REFERENCE,
  BALANCE_PAYMENT_REFERENCE_NOT_APPLICABLE,
  BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER,
  BALANCE_STATUS_BADGE_COLOR,
  BALANCE_STATUS_LABELS
} from '@/shared/constants/balance.constants'
import { BalanceRequestDto } from '@/shared/types/balance.types'
import { formatBalanceMxn } from '@/shared/utils/balance.utils'
import { formatBusinessDateShort } from '@/shared/utils/date.utils'

interface BalanceRequestCardProps {
  request: BalanceRequestDto
  onRequestCancel: (request: BalanceRequestDto) => void
  isCancelling: boolean
}

const FIELD_LABEL_CLASS = 'text-sm text-gray-500 dark:text-gray-400'
const FIELD_VALUE_CLASS = 'text-sm font-medium text-gray-900 dark:text-white'

const getDecisionText = (request: BalanceRequestDto): string => {
  if (request.decisionAt) return formatBusinessDateShort(request.decisionAt)
  if (request.status === 'pending') return BALANCE_STATUS_LABELS.pending

  return BALANCE_DECISION_NONE
}

const getPaymentReferenceText = (request: BalanceRequestDto): string | null => {
  if (request.paymentReference) return request.paymentReference
  if (request.status === 'pending') return BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER
  if (request.status === 'cancelled' || request.status === 'rejected') {
    return BALANCE_PAYMENT_REFERENCE_NOT_APPLICABLE
  }

  return null
}

export const BalanceRequestCard = ({
  request,
  onRequestCancel,
  isCancelling
}: BalanceRequestCardProps): JSX.Element => {
  const handleCancelClick = () => onRequestCancel(request)
  const isPending = request.status === 'pending'
  const paymentReferenceText = getPaymentReferenceText(request)
  const showFooter = isPending || Boolean(request.decisionReason)

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div
          className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between"
        >
          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_AMOUNT}</p>
            <p className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBalanceMxn(request.amount)}
              </span>{' '}
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">MXN</span>
            </p>
          </div>

          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_CREATED}</p>
            <p className={FIELD_VALUE_CLASS}>{formatBusinessDateShort(request.createdAt)}</p>
          </div>

          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_DECISION}</p>
            <p className={FIELD_VALUE_CLASS}>{getDecisionText(request)}</p>
          </div>

          {paymentReferenceText && (
            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_PAYMENT_REFERENCE}</p>
              <p className={FIELD_VALUE_CLASS}>{paymentReferenceText}</p>
            </div>
          )}
        </div>

        <Badge color={BALANCE_STATUS_BADGE_COLOR[request.status]}>{BALANCE_STATUS_LABELS[request.status]}</Badge>
      </div>

      {showFooter && (
        <>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          {isPending ? (
            <div className="flex justify-center">
              <Button
                color="red"
                outline
                disabled={isCancelling}
                onClick={handleCancelClick}
                className="hover:cursor-pointer"
              >
                {BALANCE_CANCEL_ACTION}
              </Button>
            </div>
          ) : (
            request.decisionReason && (
              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_DECISION_REASON}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.decisionReason}</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

export const BalanceRequestCardSkeleton = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
)
