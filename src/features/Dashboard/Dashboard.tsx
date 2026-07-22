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
import { HeaderMenuMobile } from '@/shared/ui/organisms/HeaderMenuDrawer'
import { MarginProfitSubscreen } from './subscreens/MarginProfitSubscreen'
import { AddressesSubscreen } from './subscreens/AddressesSubscreen'
import { BalanceDisplay } from '@/features/Balance/BalanceDisplay'

export interface DashboardProps {
  userInfo: LoginData | null
}

export const Dashboard = ({ userInfo }: DashboardProps) => {
  const router = useRouter()
  const { isMobileTablet } = useMediaQuery()

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

  if (isMobileTablet) {
    return (
      <div className='mt-3 flex flex-col gap-4"'>
        <header className="p-4 flex flex-row justify-between items-center">
          <Logo isLogoBlue />
          <HeaderMenuMobile screen={screen} updateScreen={updateScreen} handleSignOut={handleSignOut} />
        </header>
        <BalanceDisplay />
        { screen === 'quotes' && (<QuotesSubscreen userInfo={userInfo} />) }
        { screen === 'overview' && (<Order userInfo={userInfo} />) }
        { screen === 'marginProfit' && (<MarginProfitSubscreen userInfo={userInfo} />) }
        { screen === 'addresses' && (<AddressesSubscreen userInfo={userInfo} />) }
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen grid grid-dashboard">
      <Aside screen={screen} updateScreen={updateScreen} handleSignOut={handleSignOut} userInfo={userInfo} />
      { screen === 'quotes' && (<QuotesSubscreen userInfo={userInfo} />) }
      { screen === 'overview' && (<Order userInfo={userInfo} />) }
      { screen === 'marginProfit' && (<MarginProfitSubscreen userInfo={userInfo} />) }
      { screen === 'addresses' && (<AddressesSubscreen userInfo={userInfo} />) }
    </div>
  )
}
