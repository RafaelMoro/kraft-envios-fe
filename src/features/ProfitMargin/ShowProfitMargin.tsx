"use client"

import { ProfitMargin } from "@/shared/types/margin-profit.types"
import { RiLineChartLine } from "@remixicon/react"
import { Card } from "flowbite-react"

interface ShowProfitMarginProps {
  data: ProfitMargin | null | undefined
}

export const ShowProfitMargin = ({ data }: ShowProfitMarginProps) => {
  const isPercentage = data?.type === 'percentage'
  const value = data?.value ?? '0'
  const currentMargin = isPercentage ? `${value}%` : `$${value}`

  return (
    <>
      <Card href="#" className="max-w-sm">
        <h2 className="text-2xl font-bold text-center tracking-tight">Margen de ganancia actual</h2>
        <div className="text-green-700 dark:text-green-400 flex justify-center gap-2">
          { isPercentage && <RiLineChartLine /> }
          <p className="text-lg">
            +
            {currentMargin}
          </p>
        </div>
      </Card>
    </>
  )
}