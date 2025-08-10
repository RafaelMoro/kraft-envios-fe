"use client"

import { useRouter } from 'next/navigation'
import { Button } from "flowbite-react"
import { LOGIN_ROUTE } from '@/shared/constants/global.constants'
import { LoginData } from '@/shared/types/login.types'

export interface DashboardProps {
  userInfo: LoginData | null
}

export const Dashboard = ({ userInfo }: DashboardProps) => {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out')
    router.push(LOGIN_ROUTE)
  }

  return (
    <div className="w-full min-h-screen max-w-screen-2xl flex mx-auto my-0 p-4">
      <aside className="w-72 border-r border-r-gray-600">
        <Button color="red" outline onClick={handleSignOut}>Cerrar sesión</Button>
      </aside>
      <main>
        <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      </main>
    </div>
  )
}