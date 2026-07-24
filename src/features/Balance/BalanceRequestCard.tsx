import { Badge, Button } from 'flowbite-react'

import {
  BALANCE_CANCEL_ACTION,
  BALANCE_DECISION_NONE,
  BALANCE_FIELD_AMOUNT,
  BALANCE_FIELD_CREATED,
  BALANCE_FIELD_DECISION,
  BALANCE_FIELD_DECISION_REASON,
  BALANCE_FIELD_PAYMENT_REFERENCE,
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

const getDecisionText = (request: BalanceRequestDto): string => {
  if (request.decisionAt) return formatBusinessDateShort(request.decisionAt)
  if (request.status === 'pending') return BALANCE_STATUS_LABELS.pending

  return BALANCE_DECISION_NONE
}

export const BalanceRequestCard = ({
  request,
  onRequestCancel,
  isCancelling
}: BalanceRequestCardProps): JSX.Element => {
  const handleCancelClick = () => onRequestCancel(request)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_FIELD_AMOUNT}</p>
        <p className="text-base font-bold text-gray-900 dark:text-white">
          {formatBalanceMxn(request.amount)} MXN
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
        <Badge color={BALANCE_STATUS_BADGE_COLOR[request.status]}>{BALANCE_STATUS_LABELS[request.status]}</Badge>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_FIELD_CREATED}</p>
        <p className="text-sm text-gray-900 dark:text-white">{formatBusinessDateShort(request.createdAt)}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_FIELD_DECISION}</p>
        <p className="text-sm text-gray-900 dark:text-white">{getDecisionText(request)}</p>
      </div>

      {request.paymentReference && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_FIELD_PAYMENT_REFERENCE}</p>
          <p className="text-sm text-gray-900 dark:text-white">{request.paymentReference}</p>
        </div>
      )}

      {request.decisionReason && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_FIELD_DECISION_REASON}</p>
          <p className="text-sm text-gray-900 dark:text-white">{request.decisionReason}</p>
        </div>
      )}

      {request.status === 'pending' && (
        <Button
          color="failure"
          size="sm"
          disabled={isCancelling}
          onClick={handleCancelClick}
          className="hover:cursor-pointer"
        >
          {BALANCE_CANCEL_ACTION}
        </Button>
      )}
    </div>
  )
}

export const BalanceRequestCardSkeleton = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
  >
    <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
  </div>
)
