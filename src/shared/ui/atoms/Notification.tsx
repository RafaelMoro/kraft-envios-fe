import { Toast, ToastToggle } from "flowbite-react"
import { HiX } from "react-icons/hi"

interface NotificationProps {
  message: string
  toggleNotification: () => void
}
export const Notification = ({ message, toggleNotification }: NotificationProps) => {
  return (
    <div className="w-full flex justify-center absolute top-0">
      <Toast>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
          <HiX className="h-5 w-5" />
        </div>
        <p className="ml-3 text-sm font-normal">{message}</p>
        <ToastToggle onDismiss={toggleNotification} />
      </Toast>
    </div>
  )
}