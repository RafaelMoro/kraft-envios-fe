import { ReactNode } from "react";
import clsx from "clsx"

interface MenuMobileLinkProps {
  onClickCb: () => void;
  children: ReactNode
  isSelected?: boolean
}

export const MenuMobileLink = ({ children, onClickCb, isSelected }: MenuMobileLinkProps) => {
  const buttonCss = clsx(
    "w-full flex gap-1 rounded-lg p-2 text-base font-normal hover:bg-gray-200 dark:hover:bg-gray-700",
    { "text-gray-300": !isSelected },
    { "text-white bg-indigo-900 dark:bg-indigo-700": isSelected }
  )

  return (
    <button
      onClick={onClickCb}
      className={buttonCss}>
      {children}
    </button>
  )
}