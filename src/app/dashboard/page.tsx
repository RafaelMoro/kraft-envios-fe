import dynamic from 'next/dynamic'
const Dashboard = dynamic(() => import('@/features/Dashboard/Dashboard').then(m => m.Dashboard), { ssr: false })
import { getAccessToken, getUserInfo } from "@/shared/lib/auth.lib";
import { LoginRequiredModal } from '@/shared/ui/organisms/LoginRequiredModal';

export default async function DashboardPage() {
  const [ accessToken, userInfo ] = await Promise.all([
    getAccessToken(),
    getUserInfo(),
  ])

  return (
    <>
      <LoginRequiredModal accessToken={accessToken} />
      <Dashboard userInfo={userInfo} />
    </>
  )
}