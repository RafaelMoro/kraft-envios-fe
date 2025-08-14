"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { LOGIN_ROUTE, SIGN_OUT_API_ENDPOINT } from '@/shared/constants/global.constants'
import { LoginData } from '@/shared/types/login.types'
import { DashboardScreens } from '@/shared/types/dashboard.types'
import { saveDashboardScreen } from '@/shared/lib/preferences.lib'
import { QuotesSubscreen } from './subscreens/QuotesSubscreen'
import { Order } from './subscreens/Order'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { Aside } from '@/shared/ui/organisms/Aside'
import { Logo } from '@/shared/ui/atoms/Logo'

export interface DashboardProps {
  userInfo: LoginData | null
}

export const Dashboard = ({ userInfo }: DashboardProps) => {
  const router = useRouter()
  const { isMobile } = useMediaQuery()

  // TODO: Change this to null when we have more screens
  const [screen, setScreen] = useState<DashboardScreens | null>('quotes')
  const updateScreen = async (newScreen: DashboardScreens) => {
    await saveDashboardScreen(newScreen)
    setScreen(newScreen)
  }

  const handleSignOut = async () => {
    await fetch(SIGN_OUT_API_ENDPOINT)
    router.push(LOGIN_ROUTE)
  }

  if (isMobile) {
    return (
      <div className='mt-3 flex flex-col gap-4"'>
        <header className="p-4 flex flex-row justify-between items-center">
          <Logo isMobile={isMobile} />
        </header>
        { screen === 'quotes' && (<QuotesSubscreen userInfo={userInfo} />) }
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen max-w-screen-2xl flex mx-auto my-0">
      <Aside screen={screen} updateScreen={updateScreen} handleSignOut={handleSignOut} />
      { screen === 'quotes' && (<QuotesSubscreen userInfo={userInfo} />) }
      { screen === 'overview' && (<Order userInfo={userInfo} />) }
    </div>
  )
}