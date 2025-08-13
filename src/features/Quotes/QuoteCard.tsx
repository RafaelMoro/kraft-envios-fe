import { RiBuilding3Line, RiTruckLine } from "@remixicon/react"
import Image from "next/image"

import { QuoteUI } from "@/shared/types/quotes.types"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon"

interface QuoteProps {
  quote: QuoteUI
}

export const QuoteCard = ({ quote }: QuoteProps) => {
  if (quote.logoSrc.source === 'none') {
    return (
      <article
        data-testid="quote-no-img"
        className="flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="h-full p-4 grid grid-card-quote grid-cols-3 gap-y-2">
          <div className="col-start-1 col-end-3 row-start-1 row-end-2 inline-flex gap-2">
            <RiTruckLine size={24} />
            <h5 className="text-lg text-gray-900 dark:text-white">
              {quote.service}
            </h5>
          </div>
          <div className="col-start-1 col-end-3 row-start-2 row-end-3 inline-flex gap-2">
            <RiBuilding3Line size={16} />
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {quote.source}
            </p>
          </div>
          <p className="row-span-2 col-start-3 col-end-4 font-semibold text-2xl place-self-center">
            {quote.amountFormatted}
          </p>
        </div>
    </article>
    )
  }

  return (
    <article
        data-testid="quote-img"
        className="flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="h-full p-4 grid grid-card-quote grid-cols-3 gap-y-2">
          <div className="row-span-2 justify-self-center place-self-center">
            { quote.logoSrc.source === 'paquetexpres' && (<PaqueteExpressIcon />) }
            { quote.logoSrc.source !== 'paquetexpres' && quote.logoSrc.source !== 'none' && (
              <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
            )}
          </div>
          <h5 className="text-base text-gray-900 dark:text-white">
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