"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "flowbite-react"

import { LOGIN_ROUTE, SIGN_OUT_API_ENDPOINT } from '@/shared/constants/global.constants'
import { LoginData } from '@/shared/types/login.types'
import { DashboardScreens } from '@/shared/types/dashboard.types'
import { saveDashboardScreen } from '@/shared/lib/preferences.lib'
import { RiArticleLine, RiMoneyDollarBoxLine } from '@remixicon/react'
import { DashboardAsideLink } from './DashboardAsideLink'
import { QuotesSubscreen } from './subscreens/QuotesSubscreen'
import { Order } from './subscreens/Order'
import { Logo } from '@/shared/ui/atoms/Logo'
import { ToggleDarkMode } from '@/shared/ui/atoms/ToggleDarkMode'

export interface DashboardProps {
  userInfo: LoginData | null
}

export const Dashboard = ({ userInfo }: DashboardProps) => {
  const router = useRouter()
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

  return (
    <div className="w-full min-h-screen max-w-screen-2xl flex mx-auto my-0">
      <aside className="w-72 border-r border-r-gray-600 p-4">
        <div className='flex w-full justify-between'>
          <Logo />
          <ToggleDarkMode />
        </div>
        <nav className="mt-10 flex flex-col mb-10">
          <DashboardAsideLink isSelected={screen === 'quotes'} onClickCb={() => updateScreen('quotes')}>
            <RiMoneyDollarBoxLine />
            Cotizaciones
          </DashboardAsideLink>
          <DashboardAsideLink isSelected={screen === 'overview'} onClickCb={() => updateScreen('overview')}>
            <RiArticleLine />
            Ver guias
          </DashboardAsideLink>
        </nav>
        <Button color="red" outline onClick={handleSignOut}>Cerrar sesión</Button>
      </aside>
      { screen === 'quotes' && (<QuotesSubscreen userInfo={userInfo} />) }
      { screen === 'overview' && (<Order userInfo={userInfo} />) }
    </div>
  )
}