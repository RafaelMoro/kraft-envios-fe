import { Badge, Button } from 'flowbite-react'

import {
  BALANCE_ADMIN_ADMIN_UNASSIGNED,
  BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE,
  BALANCE_ADMIN_FIELD_REFERENCE,
  BALANCE_ADMIN_VIEW_DETAIL,
  BALANCE_DECISION_NONE,
  BALANCE_FIELD_AMOUNT,
  BALANCE_FIELD_CREATED,
  BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER,
  BALANCE_STATUS_BADGE_COLOR,
  BALANCE_STATUS_LABELS
} from '@/shared/constants/balance.constants'
import { AdminBalanceRequestDto } from '@/shared/types/balance.types'
import { formatBalanceMxn } from '@/shared/utils/balance.utils'
import { formatBusinessDateShort } from '@/shared/utils/date.utils'

interface BalanceAdminRequestCardProps {
  request: AdminBalanceRequestDto
  onViewDetail: (request: AdminBalanceRequestDto) => void
}

const FIELD_LABEL_CLASS = 'text-sm text-gray-500 dark:text-gray-400'
const FIELD_VALUE_CLASS = 'text-sm font-medium text-gray-900 dark:text-white'

const getReferenceText = (request: AdminBalanceRequestDto): string => {
  if (request.paymentReference) return request.paymentReference
  if (request.status === 'pending') return BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER

  return BALANCE_DECISION_NONE
}

export const BalanceAdminRequestCard = ({
  request,
  onViewDetail
}: BalanceAdminRequestCardProps): JSX.Element => {
  const handleViewDetail = () => onViewDetail(request)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
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
            <p className={FIELD_LABEL_CLASS}>Usuario</p>
            <p className={FIELD_VALUE_CLASS}>{request.userName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{request.userEmail}</p>
          </div>

          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_CREATED}</p>
            <p className={FIELD_VALUE_CLASS}>{formatBusinessDateShort(request.createdAt)}</p>
          </div>

          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_REFERENCE}</p>
            <p className={FIELD_VALUE_CLASS}>{getReferenceText(request)}</p>
          </div>

          <div>
            <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE}</p>
            <p className={FIELD_VALUE_CLASS}>{request.adminInCharge ?? BALANCE_ADMIN_ADMIN_UNASSIGNED}</p>
          </div>
        </div>

        <Badge color={BALANCE_STATUS_BADGE_COLOR[request.status]}>{BALANCE_STATUS_LABELS[request.status]}</Badge>
      </div>

      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      <div className="flex justify-center">
        <Button color="alternative" onClick={handleViewDetail} className="hover:cursor-pointer">
          {BALANCE_ADMIN_VIEW_DETAIL}
        </Button>
      </div>
    </div>
  )
}

export const BalanceAdminRequestCardSkeleton = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between">
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
)
