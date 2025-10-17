import { ReactNode } from "react";
import clsx from "clsx"

interface DashboardAsideLinkProps {
  onClickCb: () => void;
  children: ReactNode
  isSelected?: boolean
}

export const DashboardAsideLink = ({ onClickCb, children, isSelected }: DashboardAsideLinkProps) => {
  const buttonCss = clsx(
    "text-gray-300 flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-indigo-900 dark:hover:bg-indigo-700 focus-visible:outline-2",
    { "text-white bg-indigo-900 dark:bg-indigo-700": isSelected }
  )

  return (
    <button onClick={onClickCb} className={buttonCss}>
      {children}
    </button>
  )
}