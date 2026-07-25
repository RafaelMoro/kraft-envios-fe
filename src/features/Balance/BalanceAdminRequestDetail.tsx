'use client'

import { RiArrowLeftSLine, RiCheckLine, RiRefreshLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Badge, Button } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { BalanceDecisionForm } from '@/features/Balance/BalanceDecisionForm'
import { BalanceRequestUnauthorized } from '@/features/Balance/BalanceRequestUnauthorized'
import {
  BALANCE_ADMIN_ADMIN_UNASSIGNED,
  BALANCE_ADMIN_DRAWER_INFO_TITLE,
  BALANCE_ADMIN_DRAWER_TITLE,
  BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE,
  BALANCE_ADMIN_FIELD_REQUEST_ID,
  BALANCE_ADMIN_FIELD_UPDATED,
  BALANCE_ADMIN_FIELD_USER,
  BALANCE_DETAIL_BACK_ACTION,
  BALANCE_DETAIL_DECISION_SUBTITLE,
  BALANCE_DETAIL_ERROR_BODY,
  BALANCE_DETAIL_ERROR_RETRY,
  BALANCE_DETAIL_ERROR_TITLE,
  BALANCE_DETAIL_EYEBROW,
  BALANCE_DETAIL_LOADING_MESSAGE,
  BALANCE_DETAIL_NOT_FOUND_BODY,
  BALANCE_DETAIL_NOT_FOUND_TITLE,
  BALANCE_DETAIL_READ_ONLY_MESSAGE,
  BALANCE_DETAIL_SUBTITLE,
  BALANCE_DETAIL_SUCCESS_BODY,
  BALANCE_DETAIL_SUCCESS_TITLE,
  BALANCE_DETAIL_SUCCESS_VIEW_ACTION,
  BALANCE_FIELD_AMOUNT,
  BALANCE_FIELD_CREATED,
  BALANCE_FIELD_DECISION_REASON,
  BALANCE_FIELD_PAYMENT_REFERENCE,
  BALANCE_STATUS_BADGE_COLOR,
  BALANCE_STATUS_LABELS
} from '@/shared/constants/balance.constants'
import {
  DASHBOARD_ROUTE,
  LOGIN_REDIRECT_PARAM,
  LOGIN_ROUTE,
  buildBalanceRequestDetailRoute
} from '@/shared/constants/global.constants'
import { AdminBalanceRequestDto, BalanceRequestNotFoundError } from '@/shared/types/balance.types'
import { LinkButton } from '@/shared/ui/atoms/LinkButton'
import { formatBalanceDetailTimestamp, formatBalanceMxn, getAdminBalanceRequestCb } from '@/shared/utils/balance.utils'

interface BalanceAdminRequestDetailProps {
  requestId: string
}

const FIELD_LABEL_CLASS = 'text-sm text-gray-500 dark:text-gray-400'
const FIELD_VALUE_CLASS = 'text-sm font-medium text-gray-900 dark:text-white'

const BackToDashboardLink = (): JSX.Element => (
  <Link
    href={DASHBOARD_ROUTE}
    className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary-700 hover:underline dark:text-primary-400"
  >
    <RiArrowLeftSLine size={18} />
    {BALANCE_DETAIL_BACK_ACTION}
  </Link>
)

export const BalanceAdminRequestDetail = ({ requestId }: BalanceAdminRequestDetailProps): JSX.Element => {
  const router = useRouter()
  const [showSuccessPanel, setShowSuccessPanel] = useState(false)

  const { data, isPending, isError, error, refetch } = useQuery<
    AdminBalanceRequestDto,
    AxiosError<BalanceRequestNotFoundError>
  >({
    queryKey: ['balance', 'requests', 'admin', requestId],
    queryFn: () => getAdminBalanceRequestCb(requestId)
  })

  // The backend cookie is only known to be current at request time, so the
  // login redirect and the admin guard are both driven by this response's
  // status rather than a server-rendered pre-check.
  const status = error?.response?.status
  const isUnauthenticated = status === 400
  const isForbidden = status === 403
  const isNotFound = status === 404

  useEffect(() => {
    if (!isUnauthenticated) return

    const returnUrl = buildBalanceRequestDetailRoute(requestId)
    router.push(`${LOGIN_ROUTE}?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(returnUrl)}`)
  }, [isUnauthenticated, requestId, router])

  if (isForbidden) {
    return <BalanceRequestUnauthorized />
  }

  return (
    <main className="w-full p-4 flex flex-col gap-6">
      <BackToDashboardLink />

      {!showSuccessPanel && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-300">
            {BALANCE_DETAIL_EYEBROW}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{BALANCE_ADMIN_DRAWER_TITLE}</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-300">{BALANCE_DETAIL_SUBTITLE}</p>
        </div>
      )}

      {showSuccessPanel && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <RiCheckLine size={24} />
          </span>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_DETAIL_SUCCESS_TITLE}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{BALANCE_DETAIL_SUCCESS_BODY}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href={DASHBOARD_ROUTE}>{BALANCE_DETAIL_BACK_ACTION}</LinkButton>
            <Button color="alternative" onClick={() => setShowSuccessPanel(false)} className="hover:cursor-pointer">
              {BALANCE_DETAIL_SUCCESS_VIEW_ACTION}
            </Button>
          </div>
        </div>
      )}

      {!showSuccessPanel && (isPending || isUnauthenticated) && (
        <div role="status" aria-live="polite" className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="sr-only">{BALANCE_DETAIL_LOADING_MESSAGE}</span>
          <div className="flex flex-col gap-4">
            <div className="h-9 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      )}

      {!showSuccessPanel && !isPending && isError && isNotFound && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
          <div role="alert">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_DETAIL_NOT_FOUND_TITLE}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{BALANCE_DETAIL_NOT_FOUND_BODY}</p>
          </div>
        </div>
      )}

      {!showSuccessPanel && !isPending && isError && !isNotFound && !isUnauthenticated && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <RiRefreshLine size={24} />
          </span>
          <div role="alert">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_DETAIL_ERROR_TITLE}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{BALANCE_DETAIL_ERROR_BODY}</p>
          </div>
          <Button onClick={() => refetch()} className="hover:cursor-pointer">
            {BALANCE_DETAIL_ERROR_RETRY}
          </Button>
        </div>
      )}

      {!showSuccessPanel && !isPending && !isError && data && (
        <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_AMOUNT}</p>
              <p className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatBalanceMxn(data.amount)}</span>{' '}
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">MXN</span>
              </p>
            </div>
            <Badge color={BALANCE_STATUS_BADGE_COLOR[data.status]}>{BALANCE_STATUS_LABELS[data.status]}</Badge>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{BALANCE_ADMIN_DRAWER_INFO_TITLE}</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_REQUEST_ID}</p>
                <p className={FIELD_VALUE_CLASS}>{data.id}</p>
              </div>

              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_CREATED}</p>
                <p className={FIELD_VALUE_CLASS}>{formatBalanceDetailTimestamp(data.createdAt)}</p>
              </div>

              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_USER}</p>
                <p className={FIELD_VALUE_CLASS}>{data.userName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{data.userEmail}</p>
              </div>

              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_UPDATED}</p>
                <p className={FIELD_VALUE_CLASS}>{formatBalanceDetailTimestamp(data.updatedAt)}</p>
              </div>

              <div>
                <p className={FIELD_LABEL_CLASS}>{BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE}</p>
                <p className={FIELD_VALUE_CLASS}>{data.adminInCharge ?? BALANCE_ADMIN_ADMIN_UNASSIGNED}</p>
              </div>

              {data.paymentReference && (
                <div>
                  <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_PAYMENT_REFERENCE}</p>
                  <p className={FIELD_VALUE_CLASS}>{data.paymentReference}</p>
                </div>
              )}

              {data.status !== 'pending' && data.decisionReason && (
                <div>
                  <p className={FIELD_LABEL_CLASS}>{BALANCE_FIELD_DECISION_REASON}</p>
                  <p className={FIELD_VALUE_CLASS}>{data.decisionReason}</p>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {data.status === 'pending' ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">{BALANCE_DETAIL_DECISION_SUBTITLE}</p>
              <BalanceDecisionForm requestId={data.id} onDecided={() => setShowSuccessPanel(true)} />
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{BALANCE_DETAIL_READ_ONLY_MESSAGE}</p>
          )}
        </div>
      )}
    </main>
  )
}
