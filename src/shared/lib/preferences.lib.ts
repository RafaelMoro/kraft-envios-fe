"use server"
import { cookies } from 'next/headers'
import { DASHBOARD_SCREEN_KEY } from '../constants/global.constants'

export const saveDashboardScreen = async (dashboardScreen: string): Promise<void> => {
  await cookies().set(DASHBOARD_SCREEN_KEY, dashboardScreen, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  })
}