"use client"
import Image from "next/image"

import { useNotification } from "@/shared/hooks/useNotification"
import { Notification } from "../../shared/ui/atoms/Notification"
import { LoginCard } from "./LoginCard"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

export const Login = () => {
  const { notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()
  const { isDesktop } = useMediaQuery()

  const imageWidth = isDesktop ? 324: 224
  const imageHeight = isDesktop ? 212 : 112

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
        <div className="bg-white rounded-full w-[174px] h-[174px] md:w-[224px] md:h-[224px] lg:w-[324px] lg:h-[324px] flex justify-center items-center">
          <Image src="/kraft-logo.svg" alt="Kraft logo" width={imageWidth} height={imageHeight} className="object-cover" />
        </div>
      </aside>
    </div>
  )
}