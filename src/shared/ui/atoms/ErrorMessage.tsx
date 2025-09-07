import { ReactNode } from "react";

interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

export const ErrorMessage = ({ children, className }: ErrorMessageProps) => {
  return (
    <p className={`text-red-500 text-sm mt-1 ${className}`}>{children}</p>
  )
}