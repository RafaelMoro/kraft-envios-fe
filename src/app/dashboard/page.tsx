import { Dashboard } from "@/features/Dashboard/Dashboard";
import { getUserInfo } from "@/shared/lib/auth.lib";

export default async function DashboardPage() {
  const [ userInfo ] = await Promise.all([
    getUserInfo(),
  ])

  return (
    <Dashboard userInfo={userInfo} />
  )
}