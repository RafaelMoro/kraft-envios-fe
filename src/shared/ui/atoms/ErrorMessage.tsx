import { ReactNode } from "react";

interface ErrorMessageProps {
  children: ReactNode;
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return (
    <p className="text-red-500 text-sm mt-1">{children}</p>
  )
}