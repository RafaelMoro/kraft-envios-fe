"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "flowbite-react"

import { LOGIN_ROUTE, SIGN_OUT_ENDPOINT } from '@/shared/constants/global.constants'
import { LoginData } from '@/shared/types/login.types'
import { DashboardScreens } from '@/shared/types/dashboard.types'
import { saveDashboardScreen } from '@/shared/lib/preferences.lib'
import { RiArticleLine, RiMoneyDollarBoxLine } from '@remixicon/react'
import { DashboardAsideLink } from './DashboardAsideLink'

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
    await fetch(SIGN_OUT_ENDPOINT)
    router.push(LOGIN_ROUTE)
  }

  return (
    <div className="w-full min-h-screen max-w-screen-2xl flex mx-auto my-0">
      <aside className="w-72 border-r border-r-gray-600 p-4">
        <Button color="red" outline onClick={handleSignOut}>Cerrar sesión</Button>
        <nav className="mt-10 flex flex-col">
          <DashboardAsideLink isSelected={screen === 'quotes'} onClickCb={() => updateScreen('quotes')}>
            <RiMoneyDollarBoxLine />
            Cotizaciones
          </DashboardAsideLink>
          <DashboardAsideLink isSelected={screen === 'overview'} onClickCb={() => updateScreen('overview')}>
            <RiArticleLine />
            Ver guias
          </DashboardAsideLink>
        </nav>
      </aside>
      <main className='p-4'>
        <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      </main>
    </div>
  )
}