"use client"

import { getMarginProfitCb } from "@/shared/utils/margin-profit.utils"
import { useQuery } from "@tanstack/react-query"

export const ShowProfitMargin = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ['profitMargin'],
    queryFn: getMarginProfitCb
  })
  console.log('data', data)
  console.log('isPending', isPending)

  return (
    <>
      <h1 className="text-2xl font-bold text-center">Margen de ganancia actual</h1>
    </>
  )
}