"use client"
import { useState } from "react"

import { RiArticleLine, RiLineChartLine, RiMenuLine, RiMoneyDollarBoxLine } from "@remixicon/react"
import { Button, Drawer, DrawerHeader, DrawerItems, Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react"
import { MenuMobileLink } from "../atoms/MenuMobileLink"
import { ToggleDarkMode } from "../atoms/ToggleDarkMode"
import { DashboardScreens } from "@/shared/types/dashboard.types"

interface HeaderMenuMobileProps {
  screen: DashboardScreens | null
  updateScreen: (newScreen: DashboardScreens) => Promise<void>
  handleSignOut: () => Promise<void>
}

export const HeaderMenuMobile = ({ screen, updateScreen, handleSignOut }: HeaderMenuMobileProps) => {
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
      <Drawer open={openDrawer} onClose={toggleDrawer}>
        <DrawerHeader title="Menu" />
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
                    <MenuMobileLink isSelected={screen === 'marginProfit'} onClickCb={() => handleClick(updateScreen,'marginProfit')}>
                      <RiLineChartLine />
                      Margen de ganancia
                    </MenuMobileLink>
                  </SidebarItemGroup>

                  <SidebarItemGroup>
                    <ToggleDarkMode cssClass="w-full my-5" />
                    <Button outline color="red" className="w-full" onClick={handleSignOut}>Cerrar sesión</Button>
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