"use client"
import { useNotification } from "@/shared/hooks/useNotification"
import { ForgotPasswordCard } from "./ForgotPasswordCard"
import { Notification } from "@/shared/ui/atoms/Notification"

export const ForgotPassword = () => {
  const { notificationMessage, openNotification, toggleNotification, updateNotificationMessage } = useNotification()
  return (
    <div className="min-h-screen flex flex-col">
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">¿Necesitas ayuda para ingresar?</h1>
        <ForgotPasswordCard toggleNotification={toggleNotification} updateNotificationMessage={updateNotificationMessage} />
      </main>
    </div>
  )
}