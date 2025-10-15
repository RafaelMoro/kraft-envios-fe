import { RiBuilding3Line } from "@remixicon/react"
import Image from "next/image"
import clsx from "clsx"

import { QuoteTypeService, QuoteUI } from "@/shared/types/quotes.types"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon"
import { Checkbox } from "flowbite-react"

interface QuoteProps {
  quote: QuoteUI
  addSelectedQuote: (quote: QuoteUI) => void
  removeSelectedQuote: (quoteId: string) => void
}

export const QuoteCard = ({ quote, addSelectedQuote, removeSelectedQuote }: QuoteProps) => {
  console.log('quote', quote)
  const isOtherProvider = quote.logoSrc.provider === 'other'
  const isPaquetExpProvider = quote.logoSrc.provider === 'paquetexpres'
  const is99Provider = quote.courier === 'NextDay'
  const isFedexProvider = quote.logoSrc.provider === 'fedex'

  const titleStyles = clsx(
    "text-base font-semibold text-gray-900 dark:text-white",
    { "place-self-end justify-self-start": isOtherProvider || isFedexProvider }
  )

  const typeService = (quoteType: QuoteTypeService | null) => {
    if (!quoteType) return 'Standard'
    if (quoteType === 'nextDay') return 'Siguiente día'
    return 'Standard'
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkboxChecked = e.target.checked
    if (!checkboxChecked) {
      removeSelectedQuote(quote.id)
      return
    }
    addSelectedQuote(quote)
  }

  return (
    <article
      data-testid="quote-img"
      className="flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex-col hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <div className="h-full p-4 grid grid-cols-4  md:grid-cols-8 lg:grid-cols-12 gap-y-2 gap-x-3 lg:gap-x-2">
        <div className="row-span-2 flex justify-center items-center cursor-pointer">
          <Checkbox className="cursor-pointer" onChange={(event) => handleCheckboxChange(event)} />
        </div>
        <div className="md:col-span-2 lg:col-span-3 row-span-2 place-self-center">
          { isPaquetExpProvider && (<PaqueteExpressIcon />) }
          { isFedexProvider && (
            <picture className="flex h-18 lg:h-24 w-18 lg:w-24 bg-gray-800 rounded-full justify-center items-center">
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
        <div className="col-span-2 md:col-span-5 lg:col-span-8">
          <span className="text-xs font-light text-blue-700 dark:text-blue-600">Paquetería</span>
          <h5 className={titleStyles}>
            {quote.service}
          </h5>
          <span className="text-sm">{typeService(quote.typeService)}</span>
        </div>
        <p className="md:col-span-2 lg:col-span-3 md:row-span-2 font-semibold text-2xl">
          {quote.amountFormatted}
        </p>
        <div className="md:col-span-2 inline-flex gap-2 text-gray-700 dark:text-gray-400 justify-self-end">
          <RiBuilding3Line size={20} />
          <p className="text-xs">
            {quote.source}
          </p>
        </div>
      </div>
    </article>
  )
}