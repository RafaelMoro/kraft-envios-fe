import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"
import { RiLineChartLine } from "@remixicon/react"
import { Card } from "flowbite-react"

interface ProfitMarginCardProps {
  providerInfo: ProviderGlobalConfig
}

export const ProfitMarginCard = ({ providerInfo }: ProfitMarginCardProps) => {

  return (
    <Card className="mx-auto w-full lg:min-w-[387px] md:min-h-[340px] hover:bg-gray-100 dark:hover:bg-gray-700">
      <span className="text-sm text-center tracking-tight text-gray-600 dark:text-gray-400">Origen: {providerInfo.name}</span>
      <h4 className="text-2xl font-bold text-center tracking-tight">Proveedores:</h4>
      <div className="flex flex-col gap-2">
        { providerInfo.couriers.map((courier) => {
          const isPercentage = courier?.profitMargin?.type === 'percentage'
          const value = courier?.profitMargin?.value ?? null
          const currentMargin = isPercentage ? `${value}%` : `$${value}`

          return (
            <div key={courier.name} className="flex gap-2">
              <span className="text-lg text-center">{courier.name}</span>
              { isPercentage && <span className="text-green-700 dark:text-green-400"><RiLineChartLine /></span> }
              <p className="text-base text-green-700 dark:text-green-400">
                +
                {currentMargin}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}