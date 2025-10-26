import { RiCloseLine, RiErrorWarningLine } from "@remixicon/react";

interface ErrorBannerProps {
  message: string;
  toggleError: () => void
}

export const ErrorBanner = ({ message, toggleError }: ErrorBannerProps) => {
  return (
    <div className="grid grid-rows-2 gap-5 justify-items-center">
      <button className="justify-self-end" onClick={toggleError}>
        <RiCloseLine />
      </button>
      <div className="inline-flex gap-2 text-red-500">
        <RiErrorWarningLine />
        <p>{message}</p>
      </div>
    </div>
  )
}