"use client"
import { RiLineChartLine } from "@remixicon/react"
import { Card } from "flowbite-react"

import { ProfitMargin } from "@/shared/types/margin-profit.types"

interface ShowProfitMarginProps {
  data: ProfitMargin | null | undefined
}

export const ShowProfitMargin = ({ data }: ShowProfitMarginProps) => {
  const isPercentage = data?.type === 'percentage'
  const value = data?.value ?? null
  const currentMargin = isPercentage ? `${value}%` : `$${value}`

  if (!value) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center tracking-tight">Margen de ganancia no establecido</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">No se ha establecido un margen de ganancia aún.</p>
      </section>
    )
  }

  return (
    <>
      <Card href="#" className="max-w-sm mx-auto">
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