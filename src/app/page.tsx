import { redirect } from 'next/navigation';
import { Login } from "@/features/Login/Login";
import { getAccessToken, getUserInfo } from '@/shared/lib/auth.lib';
import { DASHBOARD_ROUTE, LOGIN_REDIRECT_PARAM } from '@/shared/constants/global.constants';
import { sanitizeDashboardReturnUrl } from '@/shared/utils/global.utils';

interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: HomePageProps) {
  const returnUrl = sanitizeDashboardReturnUrl(searchParams?.[LOGIN_REDIRECT_PARAM])

  const accessToken = await getAccessToken()
  if (accessToken) {
    // ponytail: defensive guard, backend authorization is the source of truth
    const userInfo = await getUserInfo()
    const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
    redirect(isAdmin ? returnUrl : DASHBOARD_ROUTE)
  }

  return (
    <Login returnUrl={returnUrl} />
  );
}
