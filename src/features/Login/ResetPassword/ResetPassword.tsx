"use client"
import { useState } from "react"
import { ResetPasswordCard } from "./ResetPasswordCard"
import { MessageCardState, ResetPasswordStatus } from "@/shared/types/login.types"
import { ResetPasswordStatusCard } from "./ResetPasswordStatusCard"

export interface ResetPasswordProps {
  slug: string
}

export const ResetPassword = ({ slug }: ResetPasswordProps) => {
  const [messageCardState, setmessageCardState] = useState<MessageCardState>({
    show: false,
    status: "idle"
  })
  console.log('messageCardState', messageCardState)
  const toggleMessageCardState = (state: ResetPasswordStatus) => {
    setmessageCardState({ show: true, status: state })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
        { !messageCardState.show && (
          <h1 className="text-black dark:text-white text-4xl text-center font-bold">
            Crea tu nueva contraseña
          </h1>
        )}
        { messageCardState.show && (
          <h1 className="text-black dark:text-white text-4xl text-center font-bold">
            { messageCardState.status === "success" ? "¡Contraseña cambiada con éxito!" : "No pudimos restablecer tu contraseña"}
          </h1>
        )}
        { !messageCardState.show && (<ResetPasswordCard slug={slug} toggleMessageCardState={toggleMessageCardState} />) }
        { messageCardState.show && (<ResetPasswordStatusCard status={messageCardState.status} />) }
      </main>
    </div>
  )
}