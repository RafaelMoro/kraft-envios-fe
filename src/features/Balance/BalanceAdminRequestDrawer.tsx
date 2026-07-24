'use client'

import { RiCloseLine } from '@remixicon/react'
import { Badge, Button, Drawer, DrawerItems } from 'flowbite-react'

import { BalanceDecisionForm } from '@/features/Balance/BalanceDecisionForm'
import {
  BALANCE_ADMIN_ADMIN_UNASSIGNED,
  BALANCE_ADMIN_DRAWER_CLOSE,
  BALANCE_ADMIN_DRAWER_INFO_TITLE,
  BALANCE_ADMIN_DRAWER_TITLE,
  BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE,
  BALANCE_ADMIN_FIELD_REQUEST_ID,
  BALANCE_ADMIN_FIELD_UPDATED,
  BALANCE_ADMIN_FIELD_USER,
  BALANCE_DECISION_NONE,
  BALANCE_FIELD_CREATED,
  BALANCE_FIELD_DECISION_REASON,
  BALANCE_STATUS_BADGE_COLOR,
  BALANCE_STATUS_LABELS
} from '@/shared/constants/balance.constants'
import { AdminBalanceRequestDto } from '@/shared/types/balance.types'
import { formatBalanceMxn } from '@/shared/utils/balance.utils'
import { formatBusinessDateShort, formatDateToSpanish } from '@/shared/utils/date.utils'

interface BalanceAdminRequestDrawerProps {
  request: AdminBalanceRequestDto | null
  onClose: () => void
}

const FIELD_LABEL_CLASS = 'text-sm text-gray-500 dark:text-gray-400'
const FIELD_VALUE_CLASS = 'text-sm font-medium text-gray-900 dark:text-white'

const formatDetailTimestamp = (timestamp: string): string => {
  const date = formatBusinessDateShort(timestamp)
  if (date === '--') return BALANCE_DECISION_NONE

  return `${date} · ${formatDateToSpanish(timestamp).time}`
}

export const BalanceAdminRequestDrawer = ({ request, onClose }: BalanceAdminRequestDrawerProps): JSX.Element => {
  return (
    <Drawer open={request !== null} onClose={onClose} position="right" className="w-full max-w-md">
      {request && (
        <DrawerItems>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_ADMIN_DRAWER_TITLE}</h2>
            <Button
              color="alternative"
              size="xs"
              aria-label={BALANCE_ADMIN_DRAWER_CLOSE}
              onClick={onClose}
              className="hover:cursor-pointer"
            >
              <RiCloseLine />
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBalanceMxn(request.amount)}
              </span>{' '}
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">MXN</span>
            </p>
            <Badge color={BALANCE_STATUS_BADGE_COLOR[request.status]}>{BALANCE_STATUS_LABELS[request.status]}</Badge>
          </div>

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{BALANCE_ADMIN_DRAWER_INFO_TITLE}</h3>

            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_CREATED}</p>
              <p className={FIELD_VALUE_CLASS}>{formatDetailTimestamp(request.createdAt)}</p>
            </div>

            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_USER}</p>
              <p className={FIELD_VALUE_CLASS}>{request.userName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{request.userEmail}</p>
            </div>

            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_UPDATED}</p>
              <p className={FIELD_VALUE_CLASS}>{formatDetailTimestamp(request.updatedAt)}</p>
            </div>

            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE}</p>
              <p className={FIELD_VALUE_CLASS}>{request.adminInCharge ?? BALANCE_ADMIN_ADMIN_UNASSIGNED}</p>
            </div>

            {request.status !== 'pending' && request.decisionReason && (
              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_DECISION_REASON}</p>
                <p className={FIELD_VALUE_CLASS}>{request.decisionReason}</p>
              </div>
            )}
          </div>

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          {request.status === 'pending' ? (
            <BalanceDecisionForm requestId={request.id} onDecided={onClose} />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esta solicitud ya fue decidida y no admite más acciones.
            </p>
          )}
        </DrawerItems>
      )}
    </Drawer>
  )
}
