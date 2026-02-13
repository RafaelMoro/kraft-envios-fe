import { GetGuidesData } from "@/shared/types/guides.types"
import { RiHome9Line } from "@remixicon/react"
import { Badge, Card } from "flowbite-react"

interface GuideCardProps {
  guide: GetGuidesData;
}

export const GuideCard = ({ guide }: GuideCardProps) => {
  return (
    <Card href="#" className="max-w-sm">
      <Badge color="success">{guide.status}</Badge>
      <div>
        <span>Número de Guia</span>
        <h1>{guide.trackingNumber}</h1>
        <div>
          <span>Envío: #{guide?.shipmentNumber}</span>
        </div>
      </div>
      <div>
        <div>
          <RiHome9Line />
          <p>Remitente</p>
        </div>
        <div>
          <RiHome9Line />
          <p>Destinatario</p>
        </div>
      </div>
    </Card>
  )
}