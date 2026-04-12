import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button } from "flowbite-react";
import { RiCalendarLine, RiFileDownloadLine, RiFileTextLine } from "@remixicon/react";

import { DEFAULT_IMAGE_LOGO_PROVIDER } from "@/shared/constants/quotes.constants";
import { GeneralApiError } from "@/shared/types/global.types";
import { GetGuidesData, GuideUI } from "@/shared/types/guides.types";
import { formatDateToSpanish, getGuideStatusLabel, getPkkGuide } from "@/shared/utils/guides.utils";
import { CourierImage } from "@/shared/ui/atoms/CourierImage";

interface GuideCardPkkProps {
  guide: GuideUI | null;
  updatePkkGuide: ({ guideId, guideUpdated }: {
      guideId: string;
      guideUpdated: GetGuidesData;
  }) => void
}

/**
 * Renders a specialized card component for source Pkk guides
 * The data coming from Pkk does not have all the same information as other sources.
 * We need to fetch those data afterwards when the user clicks on get information button
 * 
 * @param guide - The guide data to display, or null if no guide is available
 * @returns A styled article element with guide information and an action button
 */
export const GuideCardPkk = ({ guide, updatePkkGuide }: GuideCardPkkProps) => {
  const [fetchGuide, setFetchGuide] = useState(false)
  const isGuideUpdated = useRef(false)
  const {
    data,
  } = useQuery<{ guide: GetGuidesData }, GeneralApiError>({
    queryKey: [`get-pkk-guide/${guide?.shipmentNumber}`],
    queryFn: () => getPkkGuide(guide?.shipmentNumber ?? ''),
    enabled: fetchGuide
  })

  useEffect(() => {
    if (data?.guide?.origin && !isGuideUpdated.current) {
      const fetchedGuide = data?.guide
      if (fetchedGuide) {
        isGuideUpdated.current = true
        updatePkkGuide({ guideId: guide?.id ?? '', guideUpdated: fetchedGuide })
      }
    }
  }, [data?.guide, guide?.id, updatePkkGuide])

  const handleGetInformation = () => {
    setFetchGuide(true)
  }

  return (
    <article className="flex rounded-lg border-dashed border-2 border-amber-950 bg-white shadow-md dark:border-amber-700 dark:bg-gray-800 flex-col max-w-sm">
        <div className="flex h-full flex-col justify-center gap-4 p-6">
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
            { guide?.content && (
              <div className="text-gray-600 dark:text-gray-400">
                <div className="inline-flex gap-2">
                  <RiFileTextLine size={18} />
                  <p className="text-xs">Contenido</p>
                </div>
                <p className="font-semibold text-ellipsis capitalize">{guide?.content?.toLowerCase()}</p>
              </div>
            )}
            { guide?.startDate && (
              <div className="text-gray-600 dark:text-gray-400">
                <div className="inline-flex gap-2">
                  <RiCalendarLine size={18} />
                  <p className="text-xs">Fecha de inicio</p>
                </div>
                <p className="font-semibold text-ellipsis capitalize">{formatDateToSpanish(new Date(guide.startDate))}</p>
              </div>
            )}
          </div>

          { /** Footer with label link */ }
          <Button color="light" className="inline-flex gap-2" onClick={handleGetInformation}>
            <RiFileDownloadLine size={18} />
            Obtener información
          </Button>
        </div>
      </article>
  )
}