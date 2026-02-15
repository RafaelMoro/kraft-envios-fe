import Image from "next/image"
import clsx from "clsx"

import { QuoteCourier, QuoteImage } from "@/shared/types/quotes.types"
import { PaqueteExpressIcon } from "../icons/PaqueteExpressIcon"

interface CourierImageProps {
  image: QuoteImage
  courier: QuoteCourier | null
  dataTestId: string
  cssImgContainer?: string
}

export const CourierImage = ({ image, courier, dataTestId, cssImgContainer }: CourierImageProps) => {
  const isOtherProvider = image.provider === 'other'
  const isPaquetExpProvider = image.provider === 'paquetexpres'
  const is99Provider = courier === 'NextDay'
  const isFedexProvider = image.provider === 'fedex'

  const imgContainerStyles = clsx(
    cssImgContainer
  )

  return (
    <div data-testid={dataTestId} className={imgContainerStyles}>
      { isPaquetExpProvider && (<PaqueteExpressIcon />) }
      { isFedexProvider && (
        <picture className="flex h-18 lg:h-24 w-18 lg:w-24 bg-gray-800 rounded-full justify-center items-center">
          <Image src={image.source} alt="Fedex provider" width={image.width} height={image.height} />
        </picture>
      ) }
      { (isOtherProvider || is99Provider) && (
        <picture className="flex h-16 w-16 md:h-24 md:w-24 dark:bg-gray-100 rounded-full justify-center items-center">
          <Image src={image.source} alt="Other provider" width={image.width} height={image.height} />
        </picture>
      ) }
      { (!isPaquetExpProvider && !isOtherProvider && !isFedexProvider && !is99Provider) && (
        <Image src={image.source} alt="Quote provider" width={image.width} height={image.height} />
      )}
    </div>
  )
}