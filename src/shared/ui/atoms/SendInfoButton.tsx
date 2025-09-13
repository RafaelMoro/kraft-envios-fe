"use client"
import { RiSendPlaneLine } from "@remixicon/react"
import { Button } from "flowbite-react"

interface SendInfoButtonProps {
  isMobile: boolean;
  handleSendInfo: () => void;
}

export const SendInfoButton = ({ isMobile, handleSendInfo }: SendInfoButtonProps) => {
  return (
    <Button color="alternative" className="inline-flex gap-2" onClick={handleSendInfo}>
      <RiSendPlaneLine size={20} />
      { !isMobile ? 'Mandar información' : 'Mandar' }
    </Button>
  )
}