import { RiCloseLine, RiErrorWarningLine } from "@remixicon/react";

interface ErrorBannerProps {
  message: string;
  toggleError: () => void
}

export const ErrorBanner = ({ message, toggleError }: ErrorBannerProps) => {
  return (
    <div className="flex justify-between p-2 border border-red-500 bg-red-100 rounded-full">
      <div className="inline-flex gap-2 text-red-500">
        <RiErrorWarningLine />
        <p>{message}</p>
      </div>
      <button className="justify-self-end text-red-500" onClick={toggleError}>
        <RiCloseLine />
      </button>
    </div>
  )
}