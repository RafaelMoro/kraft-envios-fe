import { RiBuilding3Line } from "@remixicon/react"
import Image from "next/image"
import clsx from "clsx"

import { QuoteUI } from "@/shared/types/quotes.types"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon"

interface QuoteProps {
  quote: QuoteUI
}

export const QuoteCard = ({ quote }: QuoteProps) => {
  const isOtherProvider = quote.logoSrc.source.includes('kraft')
  const isPaquetExpProvider = quote.logoSrc.source === 'paquetexpres'
  const titleStyles = clsx(
    "text-base text-gray-900 dark:text-white",
    { "place-self-end justify-self-start": isOtherProvider && !isPaquetExpProvider }
  )

  return (
    <article
        data-testid="quote-img"
        className="flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="h-full p-4 grid grid-card-quote grid-cols-3 gap-y-2">
          <div className="row-span-2 justify-self-center place-self-center">
            { isPaquetExpProvider && (<PaqueteExpressIcon />) }
            { isOtherProvider && !isPaquetExpProvider && (
              <picture className="flex h-28 w-28 bg-gray-100 rounded-full justify-center items-center">
                <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
              </picture>
            ) }
            { !isPaquetExpProvider && !isOtherProvider && (
              <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
            )}
          </div>
          <h5 className={titleStyles}>
            {quote.service}
          </h5>
          <p className="row-span-2 font-semibold text-2xl justify-self-center place-self-center">
            {quote.amountFormatted}
          </p>
          <div className="inline-flex gap-2 text-gray-700 dark:text-gray-400">
            <RiBuilding3Line size={20} />
            <p className="text-xs">
              {quote.source}
            </p>
          </div>
        </div>
    </article>
  )
}