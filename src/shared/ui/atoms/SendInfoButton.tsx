"use client"
import { RiSendPlaneLine } from "@remixicon/react"
import { Button } from "flowbite-react"

interface SendInfoButtonProps {
  isMobile: boolean;
  isPrimary?: boolean;
  handleSendInfo: () => void;
}

export const SendInfoButton = ({ isMobile, isPrimary, handleSendInfo }: SendInfoButtonProps) => {
  // If it's primary, use the primary color, otherwise use alternative
  return (
    <Button {...(!isPrimary && { color: "alternative" })} className="inline-flex gap-2" onClick={handleSendInfo}>
      <RiSendPlaneLine size={20} />
      { !isMobile ? 'Mandar información' : 'Mandar' }
    </Button>
  )
}