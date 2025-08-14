"use server"
import { cookies } from 'next/headers'
import { DASHBOARD_SCREEN_KEY, THEME_COOKIE_KEY } from '../constants/global.constants'
import { ThemeMode } from 'flowbite-react'

export const getThemePreference = async () => {
  const cookieStore = cookies()
  const theme = await cookieStore.get(THEME_COOKIE_KEY)?.value
  if (!theme) {
    // Return default
    return 'light'
  }
  return theme
}

export const saveThemeCookie = async (theme: ThemeMode): Promise<void> => {
  await cookies().set(THEME_COOKIE_KEY, theme, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  })
}

export const saveDashboardScreen = async (dashboardScreen: string): Promise<void> => {
  await cookies().set(DASHBOARD_SCREEN_KEY, dashboardScreen, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  })
}