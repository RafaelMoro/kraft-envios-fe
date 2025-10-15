"use client"
import Image from "next/image"

import { useNotification } from "@/shared/hooks/useNotification"
import { Notification } from "../../shared/ui/atoms/Notification"
import { LoginCard } from "./LoginCard"

export const Login = () => {
  const { notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()

  return (
    <div className="min-h-screen grid lg:grid-rows-1 lg:grid-cols-2 relative">
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <main className="p-4 lg:p-0 flex flex-col justify-center items-center gap-5 md:gap-10 lg:gap-20 min-h-full order-1 lg:order-2">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">Bienvenido de vuelta</h1>
        <LoginCard toggleNotification={toggleNotification} updateNotificationMessage={updateNotificationMessage}  />
      </main>
      <aside className="bg-blue-800 dark:bg-blue-900 order-2 lg:order-1 flex justify-center items-center">
        <Image src="/kraft-logo-white.webp" alt="Kraft logo" width={524} height={412} className="object-cover w-56 h-28 md:w-[424px] md:h-[312px] lg:w-[524px] lg:h-[412px]" />
      </aside>
    </div>
  )
}