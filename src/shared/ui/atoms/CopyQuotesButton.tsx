"use client"
import { RiCheckDoubleLine, RiFileCopyLine } from "@remixicon/react";
import { Button } from "flowbite-react"

interface CopyQuotesButtonProps {
  isMobile: boolean;
  handleCopyInfo: () => void;
  successCopyActionBar: string | null;
}

export const CopyQuotesButton = ({ isMobile, handleCopyInfo, successCopyActionBar }: CopyQuotesButtonProps) => {
  return (
    <Button color={Boolean(successCopyActionBar) ? "green" : "alternative"} className="inline-flex gap-2" onClick={handleCopyInfo}>
      { successCopyActionBar ? (
        <>
          <RiCheckDoubleLine size={20} />
          { !isMobile && successCopyActionBar}
        </>
      ): (
        <>
          <RiFileCopyLine size={20} />
          { !isMobile ? 'Copiar cotizaciones' : 'Copiar' }
        </>
      )}
    </Button>
  )
}