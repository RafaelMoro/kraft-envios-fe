import { ReactNode } from "react";
import clsx from "clsx"

interface DashboardAsideLinkProps {
  onClickCb: () => void;
  children: ReactNode
  isSelected?: boolean
}

export const DashboardAsideLink = ({ onClickCb, children, isSelected }: DashboardAsideLinkProps) => {
  const buttonCss = clsx(
    "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-gray-200 dark:hover:bg-gray-900  focus-visible:outline-2",
    { "dark:text-indigo-400": isSelected }
  )

  return (
    <button onClick={onClickCb} className={buttonCss}>
      {children}
    </button>
  )
}