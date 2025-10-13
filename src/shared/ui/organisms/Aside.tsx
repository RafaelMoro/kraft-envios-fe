"use client"
import { Button } from "flowbite-react"
import { RiArticleLine, RiLineChartLine, RiMoneyDollarBoxLine } from "@remixicon/react"

import { DashboardAsideLink } from "@/features/Dashboard/DashboardAsideLink"
import { Logo } from "../atoms/Logo"
import { ToggleDarkMode } from "../atoms/ToggleDarkMode"
import { DashboardScreens } from "@/shared/types/dashboard.types"
import { LoginData } from "@/shared/types/login.types"

interface AsideProps {
  screen: DashboardScreens | null
  userInfo: LoginData | null
  updateScreen: (newScreen: DashboardScreens) => Promise<void>
  handleSignOut: () => Promise<void>
}

export const Aside = ({ screen, updateScreen, handleSignOut, userInfo }: AsideProps) => {
  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')

  return (
    <aside className="w-72 bg-blue-800 dark:bg-blue-900 p-4">
      <div className='flex w-full justify-between'>
        <Logo isMobile={false} />
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
        { isAdmin && (
          <DashboardAsideLink isSelected={screen === 'marginProfit'} onClickCb={() => updateScreen('marginProfit')}>
            <RiLineChartLine />
            Margen de ganancia
          </DashboardAsideLink>
        ) }
      </nav>
      <Button color="red" outline onClick={handleSignOut}>Cerrar sesión</Button>
    </aside>
  )
}