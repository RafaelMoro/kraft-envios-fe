import Image from "next/image"

export const Logo = () => {
  return (
    <picture className="flex h-28 w-28 dark:bg-gray-100 rounded-full justify-center items-center">
      <Image src="/kraft-logo.svg" alt="Kraft logo" width={112} height={66} className="object-cover" />
    </picture>
  )
}