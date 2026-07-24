import { redirect } from 'next/navigation'

import { BalanceAdminRequestDetail } from '@/features/Balance/BalanceAdminRequestDetail'
import { BalanceRequestUnauthorized } from '@/features/Balance/BalanceRequestUnauthorized'
import { LOGIN_REDIRECT_PARAM, LOGIN_ROUTE, buildBalanceRequestDetailRoute } from '@/shared/constants/global.constants'
import { getAccessToken, getUserInfo } from '@/shared/lib/auth.lib'

export default async function BalanceRequestDetailPage({
  params
}: {
  params: { requestId: string }
}): Promise<JSX.Element> {
  const [accessToken, userInfo] = await Promise.all([getAccessToken(), getUserInfo()])

  if (!accessToken) {
    const returnUrl = buildBalanceRequestDetailRoute(params.requestId)
    redirect(`${LOGIN_ROUTE}?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(returnUrl)}`)
  }

  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
  if (!isAdmin) {
    return <BalanceRequestUnauthorized />
  }

  return <BalanceAdminRequestDetail requestId={params.requestId} />
}
