import dynamic from 'next/dynamic'
const Dashboard = dynamic(() => import('@/features/Dashboard/Dashboard').then(m => m.Dashboard), { ssr: false })
import { createTheme, ThemeProvider } from "flowbite-react";

import { getAccessToken, getUserInfo } from "@/shared/lib/auth.lib";
import { LoginRequiredModal } from '@/shared/ui/organisms/LoginRequiredModal';

const customTheme = createTheme({
  drawer: {
    header: {
      inner: {
        titleText: 'text-white',
        titleCloseIcon: 'text-white',
        titleIcon: 'text-white',
      }
    }
  }
});

export default async function DashboardPage() {
  const [ accessToken, userInfo ] = await Promise.all([
    getAccessToken(),
    getUserInfo(),
  ])

  return (
    <ThemeProvider theme={customTheme}>
      <LoginRequiredModal accessToken={accessToken} />
      <Dashboard userInfo={userInfo} />
    </ThemeProvider>
  )
}