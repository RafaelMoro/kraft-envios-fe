'use client'

import { RiInboxLine, RiRefreshLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Button, ButtonGroup, Label, Select } from 'flowbite-react'
import { useState } from 'react'

import { BalanceAdminRequestCard, BalanceAdminRequestCardSkeleton } from '@/features/Balance/BalanceAdminRequestCard'
import { BalanceAdminRequestDrawer } from '@/features/Balance/BalanceAdminRequestDrawer'
import {
  BALANCE_ADMIN_APPLY_FILTERS,
  BALANCE_ADMIN_EMPTY_ALL,
  BALANCE_ADMIN_EMPTY_PENDING,
  BALANCE_ADMIN_ERROR_BODY,
  BALANCE_ADMIN_ERROR_RETRY,
  BALANCE_ADMIN_ERROR_TITLE,
  BALANCE_ADMIN_EYEBROW,
  BALANCE_ADMIN_FILTER_STATUS_LABEL,
  BALANCE_ADMIN_HEADING,
  BALANCE_ADMIN_LOADING_MESSAGE,
  BALANCE_ADMIN_SECTION_TITLE_ALL,
  BALANCE_ADMIN_SECTION_TITLE_PENDING,
  BALANCE_ADMIN_STATUS_FILTER_LABELS,
  BALANCE_ADMIN_SUBTITLE
} from '@/shared/constants/balance.constants'
import { AdminBalanceRequestDto, AdminBalanceRequestStatusFilter } from '@/shared/types/balance.types'
import { getAdminBalanceRequestsCb } from '@/shared/utils/balance.utils'
import { getBusinessCalendarMonthYear } from '@/shared/utils/date.utils'
import { LoginData } from '@/shared/types/login.types'

interface BalanceAdminScreenProps {
  userInfo: LoginData | null
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

const STATUS_OPTIONS: AdminBalanceRequestStatusFilter[] = ['pending', 'all']

const LIMIT = 10

export const BalanceAdminScreen = ({ userInfo }: BalanceAdminScreenProps): JSX.Element | null => {
  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')

  const { month: currentMonth, year: currentYear } = getBusinessCalendarMonthYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const [draftMonth, setDraftMonth] = useState(currentMonth)
  const [draftYear, setDraftYear] = useState(currentYear)
  const [draftStatus, setDraftStatus] = useState<AdminBalanceRequestStatusFilter>('all')

  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [status, setStatus] = useState<AdminBalanceRequestStatusFilter>('all')
  const [page, setPage] = useState(1)

  const [selectedRequest, setSelectedRequest] = useState<AdminBalanceRequestDto | null>(null)

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['balance', 'requests', 'admin', month, year, page, LIMIT, status],
    queryFn: () => getAdminBalanceRequestsCb({ month, year, page, limit: LIMIT, status }),
    enabled: isAdmin
  })

  if (!isAdmin) return null

  const handleApplyFilters = () => {
    setMonth(draftMonth)
    setYear(draftYear)
    setStatus(draftStatus)
    setPage(1)
  }

  const requests = data?.requests ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const requestsCountLabel = `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`
  const sectionTitle = status === 'pending' ? BALANCE_ADMIN_SECTION_TITLE_PENDING : BALANCE_ADMIN_SECTION_TITLE_ALL
  const emptyMessage = status === 'pending' ? BALANCE_ADMIN_EMPTY_PENDING : BALANCE_ADMIN_EMPTY_ALL

  return (
    <main className="w-full p-4 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-300">
          {BALANCE_ADMIN_EYEBROW}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{BALANCE_ADMIN_HEADING}</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-300">{BALANCE_ADMIN_SUBTITLE}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-2">
          <Label htmlFor="balance-admin-month">Mes</Label>
          <Select
            id="balance-admin-month"
            className="w-32"
            value={draftMonth}
            onChange={(e) => setDraftMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="balance-admin-year">Año</Label>
          <Select
            id="balance-admin-year"
            className="w-24"
            value={draftYear}
            onChange={(e) => setDraftYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className={`text-sm font-medium text-gray-900 dark:text-white`}>{BALANCE_ADMIN_FILTER_STATUS_LABEL}</span>
          <ButtonGroup>
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option}
                color="alternative"
                aria-pressed={draftStatus === option}
                onClick={() => setDraftStatus(option)}
                className={clsx('hover:cursor-pointer font-medium', {
                  'text-primary-700 dark:text-primary-400': draftStatus === option
                })}
              >
                {BALANCE_ADMIN_STATUS_FILTER_LABELS[option]}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <Button onClick={handleApplyFilters} className="hover:cursor-pointer">
          {BALANCE_ADMIN_APPLY_FILTERS}
        </Button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{sectionTitle}</h2>
          <div role="status" aria-live="polite" className="flex flex-col gap-3">
            <span className="sr-only">{BALANCE_ADMIN_LOADING_MESSAGE}</span>
            {Array.from({ length: 3 }).map((_, index) => (
              <BalanceAdminRequestCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {!isPending && isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <RiRefreshLine size={24} />
          </span>
          <div role="alert">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_ADMIN_ERROR_TITLE}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{BALANCE_ADMIN_ERROR_BODY}</p>
          </div>
          <Button onClick={() => refetch()} className="hover:cursor-pointer">
            {BALANCE_ADMIN_ERROR_RETRY}
          </Button>
        </div>
      )}

      {!isPending && !isError && requests.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            <RiInboxLine size={24} />
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300">{emptyMessage}</p>
        </div>
      )}

      {!isPending && !isError && requests.length > 0 && (
        <div className="flex flex-col gap-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{sectionTitle}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{requestsCountLabel}</span>
          </div>
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <BalanceAdminRequestCard key={request.id} request={request} onViewDetail={setSelectedRequest} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} color="alternative">
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} size="sm" onClick={() => setPage(p)} color="alternative">
                  {p}
                </Button>
              ))}
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                color="alternative"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}

      <BalanceAdminRequestDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </main>
  )
}
