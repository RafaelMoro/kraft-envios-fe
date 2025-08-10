import { QuoteUI } from "@/shared/types/quotes.types"
import { RiBuilding3Line, RiTruckLine } from "@remixicon/react"
import { Card } from "flowbite-react"

interface QuoteProps {
  quote: QuoteUI
}

export const QuoteCard = ({ quote }: QuoteProps) => {

  return (
    <Card href="#" className="max-w-sm">
      <div className="inline-flex gap-2">
        <RiTruckLine size={30} />
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