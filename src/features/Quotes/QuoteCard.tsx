import { RiBuilding3Line } from "@remixicon/react"
import Image from "next/image"
import clsx from "clsx"

import { QuoteUI } from "@/shared/types/quotes.types"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon"

interface QuoteProps {
  quote: QuoteUI
}

export const QuoteCard = ({ quote }: QuoteProps) => {
  const isOtherProvider = quote.logoSrc.provider === 'other'
  const isPaquetExpProvider = quote.logoSrc.provider === 'paquetexpres'
  const is99Provider = quote.courier === 'NextDay'
  const isFedexProvider = quote.logoSrc.provider === 'fedex'

  const titleStyles = clsx(
    "col-span-2 text-base text-gray-900 dark:text-white",
    { "place-self-end justify-self-start": isOtherProvider || isFedexProvider }
  )

  return (
    <article
        data-testid="quote-img"
        className="flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="h-full p-4 grid grid-card-quote grid-cols-3 gap-y-2">
          <div className="row-span-2 justify-self-center place-self-center">
            { isPaquetExpProvider && (<PaqueteExpressIcon />) }
            { isFedexProvider && (
              <picture className="flex h-20 md:h-28 w-20 md:w-28 bg-gray-800 rounded-full justify-center items-center">
                <Image src={quote.logoSrc.source} alt="Fedex provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
              </picture>
            ) }
            { (isOtherProvider || is99Provider) && (
              <picture className="flex h-16 w-16 md:h-24 md:w-24 dark:bg-gray-100 rounded-full justify-center items-center">
                <Image src={quote.logoSrc.source} alt="Other provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
              </picture>
            ) }
            { (!isPaquetExpProvider && !isOtherProvider && !isFedexProvider && !is99Provider) && (
              <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
            )}
          </div>
          <h5 className={titleStyles}>
            {quote.service}
          </h5>
          <p className="md:row-span-2 font-semibold text-2xl justify-self-start md:justify-self-center place-self-center">
            {quote.amountFormatted}
          </p>
          <div className="inline-flex gap-2 text-gray-700 dark:text-gray-400 justify-self-end md:justify-self-start">
            <RiBuilding3Line size={20} />
            <p className="text-xs">
              {quote.source}
            </p>
          </div>
        </div>
    </article>
  )
}