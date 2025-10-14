"use client"
import { useNotification } from "@/shared/hooks/useNotification"
import { Notification } from "../../shared/ui/atoms/Notification"
import { LoginCard } from "./LoginCard"
import Image from "next/image"

export const Login = () => {
  const { notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()

  return (
    <div className="min-h-screen grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 relative">
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <aside className="bg-blue-800 dark:bg-blue-900 flex justify-center items-center">
        <div className="bg-white rounded-full w-[324px] h-[324px]">
          <Image src="/kraft-logo.svg" alt="Kraft logo" width={324} height={212} className="object-cover" />
        </div>
      </aside>
      <main className="flex flex-col justify-center items-center gap-20 min-h-full">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">Bienvenido de vuelta</h1>
        <LoginCard toggleNotification={toggleNotification} updateNotificationMessage={updateNotificationMessage}  />
      </main>
    </div>
  )
}