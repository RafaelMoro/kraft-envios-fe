import { RiHome9Line } from "@remixicon/react"
import { Card } from "flowbite-react"

export const GuideCardSkeleton = ({ isDesktop }: { isDesktop: boolean }) => {
  if (isDesktop) {
    return (
      <Card data-testid="guide-card-skeleton-desktop">
        <div className="grid grid-cols-12 gap-3">
          { /** Image */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>

          { /** Carrier Info */}
          <div className="col-span-2 flex flex-col gap-2">
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>

          { /** Guide and Shipment Info */}
          <div className="col-span-3 flex flex-col gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>

          { /** Address info */}
          <div className="text-gray-600 dark:text-gray-400 col-span-2 flex flex-col gap-2">
            <div className="inline-flex gap-2">
              <RiHome9Line size={18} />
              <p className="text-xs">Remitente</p>
            </div>
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>
          <div className="text-gray-600 dark:text-gray-400 col-span-2 flex flex-col gap-2">
            <div className="inline-flex gap-2">
              <RiHome9Line size={18} />
              <p className="text-xs">Destinatario</p>
            </div>
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>

          { /** Footer with label link */ }
          <div className="col-span-2 w-full flex justify-center items-center">
            <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card href="#" className="max-w-sm" data-testid="guide-card-skeleton-mobile">
      <div className="flex justify-between">
        <div className="bg-slate-400 rounded animate-pulse h-8 w-16" />
        <div className="bg-slate-400 rounded animate-pulse h-8 w-16" />
      </div>

      <div>
        <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
        <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
        <div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Envío:</span>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-5">
        <div className="text-gray-600 dark:text-gray-400">
          <div className="inline-flex gap-2">
            <RiHome9Line size={18} />
            <p className="text-xs">Remitente</p>
          </div>
          <div className="bg-slate-400 rounded animate-pulse h-8 w-24" />
          <div className="bg-slate-400 rounded animate-pulse h-8 w-24 mt-2" />
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <div className="inline-flex gap-2">
            <RiHome9Line size={18} />
            <p className="text-xs">Destinatario</p>
          </div>
          <div className="bg-slate-400 rounded animate-pulse h-8 w-24" />
          <div className="bg-slate-400 rounded animate-pulse h-8 w-24 mt-2" />
        </div>
      </div>

      <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
    </Card>
  )
}