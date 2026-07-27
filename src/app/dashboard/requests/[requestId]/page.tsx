import type { Metadata } from 'next'
import { BalanceAdminRequestDetail } from '@/features/Balance/BalanceAdminRequestDetail'

export const metadata: Metadata = {
  title: 'Solicitud de saldo',
}

export default function BalanceRequestDetailPage({
  params
}: {
  params: { requestId: string }
}): JSX.Element {
  return <BalanceAdminRequestDetail requestId={params.requestId} />
}
