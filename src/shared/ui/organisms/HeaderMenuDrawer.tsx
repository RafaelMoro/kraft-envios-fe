"use client"
import { useState } from "react"

import { RiArticleLine, RiContactsBookLine, RiLineChartLine, RiMenuLine, RiMoneyDollarBoxLine, RiWalletLine } from "@remixicon/react"
import { Button, Drawer, DrawerHeader, DrawerItems, Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react"
import { MenuMobileLink } from "../atoms/MenuMobileLink"
import { ToggleDarkMode } from "../atoms/ToggleDarkMode"
import { BALANCE_ADMIN_NAV_LABEL } from "@/shared/constants/balance.constants"
import { DashboardScreens } from "@/shared/types/dashboard.types"
import { LoginData } from "@/shared/types/login.types"

interface HeaderMenuMobileProps {
  screen: DashboardScreens | null
  userInfo: LoginData | null
  updateScreen: (newScreen: DashboardScreens) => Promise<void>
  handleSignOut: () => Promise<void>
}

export const HeaderMenuMobile = ({ screen, userInfo, updateScreen, handleSignOut }: HeaderMenuMobileProps) => {
  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const toggleDrawer = () => setOpenDrawer((prev) => !prev)

  const handleClick = (onClickCb: (newScreen: DashboardScreens) => void, newScreen: DashboardScreens) => {
    onClickCb(newScreen);
    toggleDrawer();
  }

  return (
    <>
      <Button onClick={toggleDrawer} color="dark">
        <RiMenuLine />
      </Button>
      <Drawer className="bg-blue-800 dark:bg-blue-900" open={openDrawer} onClose={toggleDrawer}>
        <DrawerHeader title="Menu principal" />
        <DrawerItems>
          <Sidebar
            aria-label="Sidebar header menu mobile"
            className="[&>div]:bg-transparent [&>div]:p-0"
          >
            <div className="flex h-full flex-col justify-between py-2">
              <div>
                <SidebarItems>
                  <SidebarItemGroup>
                    <MenuMobileLink isSelected={screen === 'quotes'} onClickCb={() => handleClick(updateScreen, 'quotes')}>
                      <RiMoneyDollarBoxLine />
                      Cotizaciones
                    </MenuMobileLink>
                    <MenuMobileLink isSelected={screen === 'overview'} onClickCb={() => handleClick(updateScreen,'overview')}>
                      <RiArticleLine />
                      Ver guias
                    </MenuMobileLink>
                    <MenuMobileLink isSelected={screen === 'addresses'} onClickCb={() => handleClick(updateScreen,'addresses')}>
                      <RiContactsBookLine />
                      Direcciones
                    </MenuMobileLink>
                    { !isAdmin && (
                      <MenuMobileLink isSelected={screen === 'balance'} onClickCb={() => handleClick(updateScreen,'balance')}>
                        <RiWalletLine />
                        Mis solicitudes
                      </MenuMobileLink>
                    ) }
                    { isAdmin && (
                      <MenuMobileLink isSelected={screen === 'balanceAdmin'} onClickCb={() => handleClick(updateScreen,'balanceAdmin')}>
                        <RiWalletLine />
                        {BALANCE_ADMIN_NAV_LABEL}
                      </MenuMobileLink>
                    ) }
                    { isAdmin && (
                      <MenuMobileLink isSelected={screen === 'marginProfit'} onClickCb={() => handleClick(updateScreen,'marginProfit')}>
                        <RiLineChartLine />
                        Margen de ganancia
                      </MenuMobileLink>
                    ) }
                  </SidebarItemGroup>

                  <SidebarItemGroup>
                    <ToggleDarkMode cssClass="w-full my-5" />
                    <Button color="dark" className="w-full" onClick={handleSignOut}>Cerrar sesión</Button>
                  </SidebarItemGroup>
                </SidebarItems>
              </div>
            </div>
          </Sidebar>
        </DrawerItems>
      </Drawer>
    </>
  )
}