import { GetGuidesData } from "@/shared/types/guides.types"
import { RiHome9Line } from "@remixicon/react"
import { Badge, Card } from "flowbite-react"

interface GuideCardProps {
  guide: GetGuidesData;
}

export const GuideCard = ({ guide }: GuideCardProps) => {
  return (
    <Card href="#" className="max-w-sm">
      { /** Preheader */}
      <div className="flex justify-between">
        <Badge color="success">{guide.status}</Badge>
        <p className="text-sm font-bold">Logo pending</p>
      </div>

      { /** Header */}
      <div>
        <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
        <h1 className="text-xl font-semibold">{guide.trackingNumber}</h1>
        <div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Envío: {guide?.shipmentNumber}</span>
        </div>
      </div>

      { /** Address info */}
      <div className="grid grid-cols-2 mt-5">
        <div className="text-gray-600 dark:text-gray-400">
          <div className="inline-flex gap-2">
            <RiHome9Line size={18} />
            <p className="text-xs">Remitente</p>
          </div>
          <p className="font-semibold text-ellipsis">{guide.origin.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{guide.origin.city}</p>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <div className="inline-flex gap-2">
            <RiHome9Line size={18} />
            <p className="text-xs">Destinatario</p>
          </div>
          <p className="font-semibold text-ellipsis">{guide.destination.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{guide.destination.city}</p>
        </div>
      </div>
    </Card>
  )
}