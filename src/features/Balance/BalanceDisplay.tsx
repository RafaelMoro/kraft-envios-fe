'use client'

import { useQuery } from '@tanstack/react-query'

import { formatBalanceMxn, getBalanceCb } from '@/shared/utils/balance.utils'

export const BalanceDisplay = (): JSX.Element => {
  const { data, isError, isFetching, isPending } = useQuery({
    queryKey: ['balance'],
    queryFn: getBalanceCb
  })

  const showSkeleton = isPending || isFetching
  const hasAmount = typeof data === 'number'

  return (
    <section
      aria-label="Saldo disponible"
      className="mx-4 rounded-lg border border-gray-200 bg-white p-3 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white lg:mx-0"
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">Saldo</p>
      <div className="mt-1 flex items-center gap-2 text-base">
        <span className="font-semibold">Saldo:</span>
        {showSkeleton ? (
          <span
            aria-hidden="true"
            className="inline-block h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          />
        ) : hasAmount ? (
          <span className="font-bold">{formatBalanceMxn(data)}</span>
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300">No disponible</span>
        )}
      </div>
      {showSkeleton && (
        <p role="status" aria-live="polite" className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          {hasAmount ? 'Actualizando saldo...' : 'Cargando saldo...'}
        </p>
      )}
      {!showSkeleton && isError && (
        <p role="status" aria-live="polite" className="mt-1 text-xs text-red-700 dark:text-red-400">
          No pudimos actualizar tu saldo. Intenta más tarde.
        </p>
      )}
      {!showSkeleton && !isError && hasAmount && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Monto disponible en MXN</p>
      )}
    </section>
  )
}
