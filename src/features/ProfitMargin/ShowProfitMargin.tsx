"use client"

import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"
import { ProfitMarginCard } from "./ProfitMarginCard"
import { ProfitMarginCardSkeleton } from "./ProfitMarginCardSkeleton"

interface ShowProfitMarginProps {
  data: ProviderGlobalConfig[] | null | undefined
  isPending: boolean
}

export const ShowProfitMargin = ({ data, isPending }: ShowProfitMarginProps) => {

  if (isPending && !data) {
    return (
      <div className="w-full items-center grid grid-cols-1 md:grid-cols-2 gap-4">
        { Array.from({ length: 4}).map((el, index) => (
          <ProfitMarginCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if ( data && data.length === 0 && !isPending) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center tracking-tight">Margen de ganancia no establecido</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">No se ha establecido un margen de ganancia aún.</p>
      </section>
    )
  }

  return (
    <div className="w-full items-center grid grid-cols-1 md:grid-cols-2 gap-4">
      { (data && data.length > 0) && data.map((provider) => (
        <ProfitMarginCard key={provider.name} providerInfo={provider} />
      ))
      }
    </div>
  )
}