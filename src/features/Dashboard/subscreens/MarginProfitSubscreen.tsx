"use client"
import { useQuery } from "@tanstack/react-query"

import { ProfitMarginForm } from "@/features/ProfitMargin/ProfitMarginForm"
import { ShowProfitMargin } from "@/features/ProfitMargin/ShowProfitMargin"
import { LoginData } from "@/shared/types/login.types"
import { getMarginProfitCb } from "@/shared/utils/margin-profit.utils"

interface MarginProgitSubscreenProps {
  userInfo: LoginData | null
}

export const MarginProfitSubscreen = ({ userInfo }: MarginProgitSubscreenProps) => {
  const { data, refetch } = useQuery({
    queryKey: ['profitMargin'],
    queryFn: getMarginProfitCb
  })
  const refetchMarginProfit = async () => {
    await refetch()
  }

  return (
    <main className='w-full p-4 flex flex-col gap-16 lg:gap-20 align-center'>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">Aquí puedes gestionar los márgenes de ganancia de tus proveedores.</p>
      </div>
      <ShowProfitMargin data={data} />
      <ProfitMarginForm refetchMarginProfit={refetchMarginProfit} />
    </main>
  )
}