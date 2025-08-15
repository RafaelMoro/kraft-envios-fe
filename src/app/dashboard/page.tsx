import dynamic from 'next/dynamic'
const Dashboard = dynamic(() => import('@/features/Dashboard/Dashboard').then(m => m.Dashboard), { ssr: false })
import { getUserInfo } from "@/shared/lib/auth.lib";

export default async function DashboardPage() {
  const [ userInfo ] = await Promise.all([
    getUserInfo(),
  ])

  return (
    <Dashboard userInfo={userInfo} />
  )
}