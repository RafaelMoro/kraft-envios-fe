import { BalanceAdminRequestDetail } from '@/features/Balance/BalanceAdminRequestDetail'

export default function BalanceRequestDetailPage({
  params
}: {
  params: { requestId: string }
}): JSX.Element {
  return <BalanceAdminRequestDetail requestId={params.requestId} />
}
