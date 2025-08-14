import Image from "next/image"
import clsx from "clsx"

interface LogoProps {
  isMobile: boolean
}

export const Logo = ({ isMobile }: LogoProps) => {
  const pictureStyles = clsx(
    "flex dark:bg-gray-100 rounded-full justify-center items-center",
    { "h-28 w-28": !isMobile },
    { "h-16 w-16": isMobile }
  )
  const width = isMobile ? 66 : 112
  const height = isMobile ? 33 : 66

  return (
    <picture className={pictureStyles}>
      <Image src="/kraft-logo.svg" alt="Kraft logo" width={width} height={height} className="object-cover" />
    </picture>
  )
}