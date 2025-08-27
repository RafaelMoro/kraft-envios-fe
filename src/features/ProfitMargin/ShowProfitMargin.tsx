"use client"

import { getMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { useQuery } from "@tanstack/react-query"

export const ShowProfitMargin = () => {
  const { data } = useQuery({
    queryKey: ['profitMargin'],
    queryFn: getMarginProfitCb
  })

  const isPercentage = data?.type === 'percentage'
  const currentMargin = isPercentage ? `${data?.value}%` : data?.value

  return (
    <>
      <h2 className="text-2xl font-bold text-center">Margen de ganancia actual: {currentMargin}</h2>
    </>
  )
}