"use client"
import { useState } from "react"

export const useNotification = () => {
  const [openNotification, setOpenNotification] = useState<boolean>(false)
  const [notificationMessage, setNotificationMessage] = useState<string>("")

  const toggleNotification = () => setOpenNotification((prev) => !prev)
  const updateNotificationMessage = (message: string) => {
    setNotificationMessage(message)
  }

  return {
    openNotification,
    notificationMessage,
    toggleNotification,
    updateNotificationMessage
  }
}