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
      <div className="grid grid-cols-2 grid-rows-3 gap-y-4">
        <div className="col-span-2 flex justify-center">
          { quote.logoSrc.source === 'paquetexpres' && (<PaqueteExpressIcon />) }
          { quote.logoSrc.source === 'none' && (<RiTruckLine size={30} />) }
          { quote.logoSrc.source !== 'paquetexpres' && quote.logoSrc.source !== 'none' && (
            <Image src={quote.logoSrc.source} alt="Quote provider" width={quote.logoSrc.width} height={quote.logoSrc.height} />
          )}
        </div>
          <h5 className="text-lg tracking-wider text-gray-900 dark:text-white">
            {quote.service}
          </h5>
        <p className="font-semibold text-2xl justify-self-end place-self-center">
          {quote.amountFormatted}
        </p>
        <div className="inline-flex gap-2">
          <RiBuilding3Line size={20} />
          <p className="text-xs text-gray-700 dark:text-gray-400">
            {quote.source}
          </p>
        </div>
      </div>
    </Card>
  )
}