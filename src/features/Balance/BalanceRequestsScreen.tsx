'use client'

import { RiInboxLine, RiRefreshLine } from '@remixicon/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select } from 'flowbite-react'
import { useState } from 'react'

import { BalanceRequestDialog } from '@/features/Balance/BalanceRequestDialog'
import { BalanceRequestCard, BalanceRequestCardSkeleton } from '@/features/Balance/BalanceRequestCard'
import {
  BALANCE_CANCEL_CONFIRM_ACTION,
  BALANCE_CANCEL_CONFIRM_BODY,
  BALANCE_CANCEL_CONFIRM_TITLE,
  BALANCE_CANCEL_DISMISS_ACTION,
  BALANCE_CANCEL_ERROR_MESSAGE,
  BALANCE_REQUESTS_EMPTY_BODY,
  BALANCE_REQUESTS_EMPTY_CTA,
  BALANCE_REQUESTS_EMPTY_TITLE,
  BALANCE_REQUESTS_ERROR_BODY,
  BALANCE_REQUESTS_ERROR_EYEBROW,
  BALANCE_REQUESTS_ERROR_RETRY,
  BALANCE_REQUESTS_ERROR_TITLE,
  BALANCE_REQUESTS_EYEBROW,
  BALANCE_REQUESTS_HEADING,
  BALANCE_REQUESTS_LOADING_MESSAGE,
  BALANCE_REQUESTS_SECTION_TITLE,
  BALANCE_REQUESTS_SUBTITLE
} from '@/shared/constants/balance.constants'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { BalanceRequestDto, CreateBalanceRequestErrorResponse } from '@/shared/types/balance.types'
import { cancelBalanceRequestCb, formatBalanceMxn, getBalanceCb, getBalanceRequestsCb } from '@/shared/utils/balance.utils'
import { getBusinessCalendarMonthYear } from '@/shared/utils/date.utils'

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

const LIMIT = 10

export const BalanceRequestsScreen = (): JSX.Element => {
  const { isMobileTablet } = useMediaQuery()
  const { month: currentMonth, year: currentYear } = getBusinessCalendarMonthYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [page, setPage] = useState(1)
  const [requestToCancel, setRequestToCancel] = useState<BalanceRequestDto | null>(null)

  const queryClient = useQueryClient()

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['balance', 'requests', selectedMonth, selectedYear, page, LIMIT],
    queryFn: () => getBalanceRequestsCb({ month: selectedMonth, year: selectedYear, page, limit: LIMIT })
  })

  const {
    data: balanceAmount,
    isPending: isBalancePending,
    isError: isBalanceError
  } = useQuery({
    queryKey: ['balance'],
    queryFn: getBalanceCb,
    enabled: !isMobileTablet
  })

  const mutation = useMutation<BalanceRequestDto, AxiosError<CreateBalanceRequestErrorResponse>, string>({
    mutationFn: cancelBalanceRequestCb,
    onSuccess: () => {
      setRequestToCancel(null)
      queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })
    }
  })

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    setPage(1)
  }

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    setPage(1)
  }

  const openCancelModal = (request: BalanceRequestDto) => {
    mutation.reset()
    setRequestToCancel(request)
  }

  const closeCancelModal = () => {
    mutation.reset()
    setRequestToCancel(null)
  }

  const confirmCancel = () => {
    if (!requestToCancel || mutation.isPending) return

    mutation.mutate(requestToCancel.id)
  }

  const requests = data?.requests ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const requestsCountLabel = `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`

  return (
    <main className="w-full p-4 flex flex-col gap-10">
      {!isMobileTablet && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">Saldo disponible</p>
          {isBalancePending ? (
            <span
              aria-hidden="true"
              className="mt-1 inline-block h-7 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            />
          ) : isBalanceError || typeof balanceAmount !== 'number' ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">No disponible</p>
          ) : (
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatBalanceMxn(balanceAmount)} MXN
            </p>
          )}
        </section>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-300">
            {BALANCE_REQUESTS_EYEBROW}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{BALANCE_REQUESTS_HEADING}</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-300">{BALANCE_REQUESTS_SUBTITLE}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="balance-requests-month">Mes</Label>
            <Select
              id="balance-requests-month"
              className="w-32"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="balance-requests-year">Año</Label>
            <Select
              id="balance-requests-year"
              className="w-24"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{BALANCE_REQUESTS_SECTION_TITLE}</h2>
          <div role="status" aria-live="polite" className="flex flex-col gap-3">
            <span className="sr-only">{BALANCE_REQUESTS_LOADING_MESSAGE}</span>
            {Array.from({ length: 3 }).map((_, index) => (
              <BalanceRequestCardSkeleton key={index} />
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
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              {BALANCE_REQUESTS_ERROR_EYEBROW}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_REQUESTS_ERROR_TITLE}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{BALANCE_REQUESTS_ERROR_BODY}</p>
          </div>
          <Button onClick={() => refetch()} className="hover:cursor-pointer">
            {BALANCE_REQUESTS_ERROR_RETRY}
          </Button>
        </div>
      )}

      {!isPending && !isError && requests.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            <RiInboxLine size={24} />
          </span>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_REQUESTS_EMPTY_TITLE}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{BALANCE_REQUESTS_EMPTY_BODY}</p>
          <BalanceRequestDialog triggerLabel={BALANCE_REQUESTS_EMPTY_CTA} triggerClassName="hover:cursor-pointer" />
        </div>
      )}

      {!isPending && !isError && requests.length > 0 && (
        <div className="flex flex-col gap-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{BALANCE_REQUESTS_SECTION_TITLE}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{requestsCountLabel}</span>
          </div>
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <BalanceRequestCard
                key={request.id}
                request={request}
                onRequestCancel={openCancelModal}
                isCancelling={mutation.isPending && requestToCancel?.id === request.id}
              />
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

      <Modal show={requestToCancel !== null} onClose={closeCancelModal} size="md">
        <ModalHeader>{BALANCE_CANCEL_CONFIRM_TITLE}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-700 dark:text-gray-300">{BALANCE_CANCEL_CONFIRM_BODY}</p>
          {mutation.isError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {BALANCE_CANCEL_ERROR_MESSAGE}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="failure"
            disabled={mutation.isPending}
            onClick={confirmCancel}
            className="hover:cursor-pointer"
          >
            {BALANCE_CANCEL_CONFIRM_ACTION}
          </Button>
          <Button color="alternative" onClick={closeCancelModal} className="hover:cursor-pointer">
            {BALANCE_CANCEL_DISMISS_ACTION}
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  )
}
