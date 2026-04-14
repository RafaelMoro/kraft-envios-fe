import { RiArticleLine, RiHome9Line } from "@remixicon/react"
import { Badge, Card } from "flowbite-react"
import clsx from "clsx"

import { primaryButtonCSS } from "@/shared/constants/global.constants";
import { GetGuidesData, GuideUI } from "@/shared/types/guides.types"
import { CourierImage } from "@/shared/ui/atoms/CourierImage";
import { DEFAULT_IMAGE_LOGO_PROVIDER } from "@/shared/constants/quotes.constants";
import { getGuideStatusLabel } from "@/shared/utils/guides.utils";
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
      <GuideCardPkk guide={guide} updatePkkGuide={updatePkkGuide} />
    )
  }
  const desktopButtonCSS = clsx(
    primaryButtonCSS,
    "w-fit inline-flex gap-2"
  )

  if (isDesktop) {
    return (
      <Card>
        { /** Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <CourierImage
              dataTestId="guide-logo-image-box"
              image={guide?.logoSrc ?? DEFAULT_IMAGE_LOGO_PROVIDER}
              courier={guide?.courier ?? null}
            />
            <div className="flex flex-col gap-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Número de Guia</span>
              <h4 className="text-xl font-semibold">{guide?.trackingNumber}</h4>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Envío: {guide?.shipmentNumber}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge color="purple">{guide?.source}</Badge>
            <Badge color="success">{getGuideStatusLabel(guide?.status ?? '')}</Badge>
          </div>
        </div>
        <hr className="text-gray-300" />

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
          <div className="mt-3 w-full flex justify-center">
            <a href={guide?.labelUrl ?? ''} target="_blank" rel="noopener noreferrer" className={desktopButtonCSS}>
              <RiArticleLine size={18} />
              Ver etiqueta
            </a>
          </div>
        )}
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