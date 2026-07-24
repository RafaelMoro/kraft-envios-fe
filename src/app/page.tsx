import { redirect } from 'next/navigation';
import { Login } from "@/features/Login/Login";
import { getAccessToken } from '@/shared/lib/auth.lib';
import { LOGIN_REDIRECT_PARAM } from '@/shared/constants/global.constants';
import { sanitizeDashboardReturnUrl } from '@/shared/utils/global.utils';

interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: HomePageProps) {
  const returnUrl = sanitizeDashboardReturnUrl(searchParams?.[LOGIN_REDIRECT_PARAM])

  const accessToken = await getAccessToken()
  if (accessToken) {
    redirect(returnUrl)
  }

  return (
    <Login returnUrl={returnUrl} />
  );
}
