"use client"
import { Button } from "flowbite-react"
import { RiArticleLine, RiMoneyDollarBoxLine } from "@remixicon/react"

import { DashboardAsideLink } from "@/features/Dashboard/DashboardAsideLink"
import { Logo } from "../atoms/Logo"
import { ToggleDarkMode } from "../atoms/ToggleDarkMode"
import { DashboardScreens } from "@/shared/types/dashboard.types"

interface AsideProps {
  screen: DashboardScreens | null
  updateScreen: (newScreen: DashboardScreens) => Promise<void>
  handleSignOut: () => Promise<void>
}

export const Aside = ({ screen, updateScreen, handleSignOut }: AsideProps) => {
  return (
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
  )
}