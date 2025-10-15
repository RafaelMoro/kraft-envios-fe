import Image from "next/image"

interface LogoProps {
  isLogoBlue?: boolean;
}

export const Logo = ({ isLogoBlue = false }: LogoProps) => {
  return (
    <picture>
      { isLogoBlue ? (
        <Image src="/kraft-logo.svg" alt="Kraft logo" width={224} height={112} className="flex justify-center items-center object-cover w-36 h-20 md:w-52 md:h-32 lg:w-72 lg:h-32" />
      ) : (
        <Image src="/kraft-logo-white.webp" alt="Kraft logo" width={524} height={412} className="flex justify-center items-center object-cover w-16 h-9 md:w-72 md:h-32" />
      ) }
    </picture>
  )
}