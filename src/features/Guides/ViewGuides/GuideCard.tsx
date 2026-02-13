import { primaryButtonCSS } from "@/shared/constants/global.constants";
import { GuideUI } from "@/shared/types/guides.types"
import { PaqueteExpressIcon } from "@/shared/ui/icons/PaqueteExpressIcon";
import { RiArticleLine, RiHome9Line } from "@remixicon/react"
import { Badge, Card } from "flowbite-react"
import Image from "next/image";

interface GuideCardProps {
  guide: GuideUI;
}

export const GuideCard = ({ guide }: GuideCardProps) => {
  const isOtherProvider = guide.logoSrc.provider === 'other'
  const isPaquetExpProvider = guide.logoSrc.provider === 'paquetexpres'
  const is99Provider = guide.courier === 'NextDay'
  const isFedexProvider = guide.logoSrc.provider === 'fedex'

  return (
    <Card href="#" className="max-w-sm">
      { /** Preheader */}
      <div className="flex justify-between">
        <Badge color="success">{guide.status}</Badge>
        <div data-testid="quote-logo-image-box" className="md:col-span-3 lg:col-span-3 row-span-2 place-self-center">
          { isPaquetExpProvider && (<PaqueteExpressIcon />) }
          { isFedexProvider && (
            <picture className="flex h-18 lg:h-24 w-18 lg:w-24 bg-gray-800 rounded-full justify-center items-center">
              <Image src={guide.logoSrc.source} alt="Fedex provider" width={guide.logoSrc.width} height={guide.logoSrc.height} />
            </picture>
          ) }
          { (isOtherProvider || is99Provider) && (
            <picture className="flex h-16 w-16 md:h-24 md:w-24 dark:bg-gray-100 rounded-full justify-center items-center">
              <Image src={guide.logoSrc.source} alt="Other provider" width={guide.logoSrc.width} height={guide.logoSrc.height} />
            </picture>
          ) }
          { (!isPaquetExpProvider && !isOtherProvider && !isFedexProvider && !is99Provider) && (
            <Image src={guide.logoSrc.source} alt="Quote provider" width={guide.logoSrc.width} height={guide.logoSrc.height} />
          )}
        </div>
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
      <div className={primaryButtonCSS}>
        <a href={guide?.labelUrl ?? ''} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2">
          <RiArticleLine size={18} />
          Ver etiqueta
        </a>
      </div>
    </Card>
  )
}