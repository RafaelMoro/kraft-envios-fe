"use client"

import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"
import { ProfitMarginCard } from "./ProfitMarginCard"

interface ShowProfitMarginProps {
  data: ProviderGlobalConfig[] | null | undefined
}

export const ShowProfitMargin = ({ data }: ShowProfitMarginProps) => {

  // if (!value) {
  //   return (
  //     <section className="flex flex-col gap-4">
  //       <h2 className="text-2xl font-bold text-center tracking-tight">Margen de ganancia no establecido</h2>
  //       <p className="text-center text-gray-600 dark:text-gray-400">No se ha establecido un margen de ganancia aún.</p>
  //     </section>
  //   )
  // }

  return (
    <div>
      { (data && data.length > 0) && (
        data.map((prov) => {
          const source = prov.name
          return prov.couriers.map((courier) => (
            <ProfitMarginCard key={courier.name} source={source} courierInfo={courier} />
          ))
        })
      ) }
    </div>
  )
}