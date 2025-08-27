"use client"

import { ProfitMargin } from "@/shared/types/margin-profit.types"

interface ShowProfitMarginProps {
  data: ProfitMargin | null | undefined
}

export const ShowProfitMargin = ({ data }: ShowProfitMarginProps) => {
  const isPercentage = data?.type === 'percentage'
  const currentMargin = isPercentage ? `${data?.value}%` : `$${data?.value}`

  return (
    <>
      <h2 className="text-2xl font-bold text-center">Margen de ganancia actual: {currentMargin}</h2>
    </>
  )
}