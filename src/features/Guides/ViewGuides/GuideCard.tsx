import { RiArticleLine, RiCalendarLine, RiFileTextLine, RiHome9Line } from "@remixicon/react"
import { Badge, Card } from "flowbite-react"
import clsx from "clsx"

import { primaryButtonCSS } from "@/shared/constants/global.constants";
import { GetGuidesData, GuideUI } from "@/shared/types/guides.types"
import { CourierImage } from "@/shared/ui/atoms/CourierImage";
import { DEFAULT_IMAGE_LOGO_PROVIDER } from "@/shared/constants/quotes.constants";
import { formatDateToSpanish, getGuideStatusLabel } from "@/shared/utils/guides.utils";
import { formatNumberToCurrency } from "@/shared/utils/global.utils";
import { GuideCardPkk } from "./GuideCardPkk";

interface GuideCardProps {
  guide: GuideUI | null;
  updatePkkGuide: ({ guideId, guideUpdated }: {
      guideId: string;
      guideUpdated: GetGuidesData;
  }) => void
  isPending: boolean;
  isDesktop: boolean;
}

export const GuideCard = ({ guide, isPending, updatePkkGuide, isDesktop }: GuideCardProps) => {
  const priceNumber = guide?.price ? Number(guide.price) : null
  const priceFormatted = formatNumberToCurrency(priceNumber)

  if (isPending && !guide) {
    return (
      <Card href="#" className="max-w-sm" data-testid="guide-card-skeleton">
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

  if (guide?.source === 'Pkk' && guide.hasBeenFetched === false) {
    return (
      <GuideCardPkk guide={guide} updatePkkGuide={updatePkkGuide} isDesktop={isDesktop} />
    )
  }
  const desktopButtonCSS = clsx(
    primaryButtonCSS,
    "w-fit inline-flex gap-2"
  )
  const dateTimeFormatted = guide?.startDate ? formatDateToSpanish(new Date(guide.startDate)) : { date: null, time: null }
  const { date, time } = dateTimeFormatted

  if (isDesktop) {
    return (
      <Card>
        <div className="grid grid-cols-12 gap-3">
          { /** Image */}
          <div className="flex items-center justify-center">
            <CourierImage
              dataTestId="guide-logo-image-box"
              image={guide?.logoSrc ?? DEFAULT_IMAGE_LOGO_PROVIDER}
              courier={guide?.courier ?? null}
            />
          </div>

          { /** Carrier Info */}
          <div className="col-span-2 flex flex-col gap-2">
            <h4 className="text-xl font-semibold">{guide?.courier ?? 'Kraft'}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{guide?.carrier}</p>
            { priceFormatted && (
              <p className="text-blue-800 font-semibold">{priceFormatted}</p>
            )}
            <div className="flex gap-2">
              <Badge color="purple">{guide?.source}</Badge>
              <Badge color="success">{getGuideStatusLabel(guide?.status ?? '')}</Badge>
            </div>
          </div>

          { /** Guide and Shipment Info */}
          <div className="col-span-3">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
            <h5 className="text-lg font-semibold">{guide?.trackingNumber}</h5>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Envío: {guide?.shipmentNumber}</span>
          </div>

          { /** Address info */}
          { Boolean(guide?.origin) && (
            <div className="text-gray-600 dark:text-gray-400 col-span-2">
              <div className="inline-flex gap-2">
                <RiHome9Line size={18} />
                <p className="text-xs">Remitente</p>
              </div>
              <p className="font-semibold text-ellipsis capitalize">{guide?.origin?.name?.toLowerCase()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{guide?.origin?.city}</p>
            </div>
          )}
          <div className="text-gray-600 dark:text-gray-400 col-span-2">
            <div className="inline-flex gap-2">
              <RiHome9Line size={18} />
              <p className="text-xs">Destinatario</p>
            </div>
            <p className="font-semibold text-ellipsis capitalize">{guide?.destination?.name?.toLowerCase()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{guide?.destination?.city}</p>
          </div>

          { (guide?.source === 'Pkk' && guide?.content) && (
            <div className="text-gray-600 dark:text-gray-400">
              <div className="inline-flex gap-2">
                <RiFileTextLine size={18} />
                <p className="text-xs">Contenido</p>
              </div>
              <p className="font-semibold text-ellipsis capitalize">{guide?.content?.toLowerCase()}</p>
            </div>
          )}
          { (guide?.source === 'Pkk' && guide?.startDate) && (
            <div className="text-gray-600 dark:text-gray-400">
              <div className="inline-flex gap-2">
                <RiCalendarLine size={18} />
                <p className="text-xs">Fecha de inicio</p>
              </div>
              <p className="font-semibold text-ellipsis capitalize">{date}</p>
              <p className="font-semibold text-ellipsis capitalize">{time}</p>
            </div>
          )}

          { /** Footer with label link */ }
          { Boolean(guide?.labelUrl) && (
            <div className="col-span-2 w-full flex justify-center items-center">
              <a href={guide?.labelUrl ?? ''} target="_blank" rel="noopener noreferrer" className={desktopButtonCSS}>
                <RiArticleLine size={18} />
                Ver etiqueta
              </a>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="max-w-sm">
      { /** Preheader */}
      <div className="flex justify-between">
        <div className="inline-flex gap-1">
          <Badge color="purple">{guide?.source}</Badge>
          <Badge color="success">{getGuideStatusLabel(guide?.status ?? '')}</Badge>
        </div>
        <CourierImage
          dataTestId="guide-logo-image-box"
          image={guide?.logoSrc ?? DEFAULT_IMAGE_LOGO_PROVIDER}
          courier={guide?.courier ?? null}
        />
      </div>

      { /** Header */}
      <div>
        <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
        <h1 className="text-xl font-semibold">{guide?.trackingNumber}</h1>
        <div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Envío: {guide?.shipmentNumber}</span>
        </div>
      </div>

      { /** Address info */}
      <div className="grid grid-cols-2 gap-1 mt-5">
        { Boolean(guide?.origin) && (
          <div className="text-gray-600 dark:text-gray-400">
            <div className="inline-flex gap-2">
              <RiHome9Line size={18} />
              <p className="text-xs">Remitente</p>
            </div>
            <p className="font-semibold text-ellipsis capitalize">{guide?.origin?.name?.toLowerCase()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{guide?.origin?.city}</p>
          </div>
        )}
        <div className="text-gray-600 dark:text-gray-400">
          <div className="inline-flex gap-2">
            <RiHome9Line size={18} />
            <p className="text-xs">Destinatario</p>
          </div>
          <p className="font-semibold text-ellipsis capitalize">{guide?.destination?.name?.toLowerCase()}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{guide?.destination?.city}</p>
        </div>
      </div>

      { /** Footer with label link */ }
      { Boolean(guide?.labelUrl) && (
        <div className={primaryButtonCSS}>
          <a href={guide?.labelUrl ?? ''} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2">
            <RiArticleLine size={18} />
            Ver etiqueta
          </a>
        </div>
      )}
    </Card>
  )
}