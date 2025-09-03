import { CourierGlobalConfig } from "@/shared/types/margin-profit.types"
import { QuoteSource } from "@/shared/types/quotes.types"
import { RiLineChartLine } from "@remixicon/react"
import { Card } from "flowbite-react"

interface ProfitMarginCardProps {
  source: QuoteSource
  courierInfo: CourierGlobalConfig
}

export const ProfitMarginCard = ({ source, courierInfo }: ProfitMarginCardProps) => {
  const isPercentage = courierInfo?.profitMargin?.type === 'percentage'
  const value = courierInfo?.profitMargin?.value ?? null
  const currentMargin = isPercentage ? `${value}%` : `$${value}`

  return (
    <Card href="#" className="max-w-sm mx-auto">
      <span className="text-sm text-center tracking-tight text-gray-600 dark:text-gray-400">Origen: {source}</span>
      <h4 className="text-2xl font-bold text-center tracking-tight">{courierInfo?.name}</h4>
      <div className="text-green-700 dark:text-green-400 flex justify-center gap-2">
        { isPercentage && <RiLineChartLine /> }
        <p className="text-lg">
          +
          {currentMargin}
        </p>
      </div>
    </Card>
  )
}