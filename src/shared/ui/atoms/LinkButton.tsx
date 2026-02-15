import { darkRedButtonCSS, greySecondaryCSS, primaryButtonCSS, secondaryButtonCSS } from "@/shared/constants/global.constants";
import Link from "next/link";
import { ReactNode } from "react";

interface LinkButtonProps {
  children: ReactNode
  href: string;
  type?: 'primary' | 'secondary' | 'darkRed' | 'greySecondary'
  className?: string
  dataTestId?: string
}

export const LinkButton = ({ children, href, className, type = 'primary', dataTestId = 'link-button' }: LinkButtonProps) => {
  
  

  const cssDic = {
    primary: primaryButtonCSS,
    secondary: secondaryButtonCSS,
    darkRed: darkRedButtonCSS,
    greySecondary: greySecondaryCSS
  }

  return (
    <Link
      data-testid={dataTestId}
      className={`${cssDic[type]} ${className && className}`}
      href={href}
    >{children}</Link>
  )
}