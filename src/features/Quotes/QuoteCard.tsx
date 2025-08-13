import { QuoteUI } from "@/shared/types/quotes.types"
import { RiBuilding3Line, RiTruckLine } from "@remixicon/react"
import { Card } from "flowbite-react"
import Image from "next/image"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon"

interface QuoteProps {
  quote: QuoteUI
}

export const QuoteCard = ({ quote }: QuoteProps) => {
  return (
    <Card href="#" className="max-w-sm">
      <div className="inline-flex gap-2">
        { quote.logoSrc.source === 'paquetexpres' && (<PaqueteExpressIcon />) }
        { quote.logoSrc.source === 'none' && (<RiTruckLine size={30} />) }
        { quote.logoSrc.source !== 'paquetexpres' && quote.logoSrc.source !== 'none' && (
          <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
        )}
        <h5 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
          {quote.service}
        </h5>
      </div>
      <div className="inline-flex gap-2">
        <RiBuilding3Line />
        <p className="text-sm text-gray-700 dark:text-gray-400">
          {quote.source}
        </p>
      </div>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {quote.amountFormatted}
      </p>
    </Card>
  )
}