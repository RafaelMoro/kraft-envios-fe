import { RiLockLine } from '@remixicon/react'

import {
  BALANCE_DETAIL_BACK_ACTION,
  BALANCE_UNAUTHORIZED_BODY,
  BALANCE_UNAUTHORIZED_TITLE
} from '@/shared/constants/balance.constants'
import { DASHBOARD_ROUTE } from '@/shared/constants/global.constants'
import { LinkButton } from '@/shared/ui/atoms/LinkButton'

export const BalanceRequestUnauthorized = (): JSX.Element => (
  <main className="flex min-h-screen w-full items-center justify-center p-4">
    <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <RiLockLine size={24} />
      </span>
      <div role="alert">
        <p className="text-lg font-bold text-gray-900 dark:text-white">{BALANCE_UNAUTHORIZED_TITLE}</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{BALANCE_UNAUTHORIZED_BODY}</p>
      </div>
      <LinkButton href={DASHBOARD_ROUTE}>{BALANCE_DETAIL_BACK_ACTION}</LinkButton>
    </div>
  </main>
)
