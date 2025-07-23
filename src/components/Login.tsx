"use client"
import { useNotification } from "@/hooks/useNotification"
import { Notification } from "./Notification"

export const Login = () => {
  const { notificationMessage, openNotification, toggleNotification,
  } = useNotification()

  return (
    <div className="min-h-screen flex flex-col relative">
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">Bienvenido de vuelta</h1>
      </main>
    </div>
  )
}