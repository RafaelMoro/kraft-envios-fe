import { redirect } from 'next/navigation';
import { Login } from "@/features/Login/Login";
import { getAccessToken } from '@/shared/lib/auth.lib';
import { DASHBOARD_ROUTE } from '@/shared/constants/global.constants';

export default async function Home() {
  const accessToken = await getAccessToken()
  if (accessToken) {
    redirect(DASHBOARD_ROUTE)
  }

  return (
    <Login />
  );
}
