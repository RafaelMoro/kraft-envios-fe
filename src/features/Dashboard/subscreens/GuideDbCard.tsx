import { RiArrowRightLine } from "@remixicon/react"
import clsx from "clsx"

import { primaryButtonCSS } from "@/shared/constants/global.constants"
import { GuideDbRecord } from "@/shared/types/guides.types"
import { getQuoteImg } from "@/shared/utils/quotes.utils"
import { getGuideDbStatusLabel } from "@/shared/utils/guides.utils"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { CourierImage } from "@/shared/ui/atoms/CourierImage"

const cityState = (city: string, state: string) => [city, state].filter(Boolean).join(', ')

export function GuideDbCard({
  guide,
  isMobile,
  onViewDetails,
}: {
  guide: GuideDbRecord
  isMobile: boolean
  onViewDetails: (guide: GuideDbRecord) => void
}) {
  const price = guide.price ? formatNumberToCurrency(Number(guide.price)) : formatNumberToCurrency(guide.quote.total)
  const statusLabel = getGuideDbStatusLabel(guide.status)
  const logoSrc = getQuoteImg({ courier: guide.quote.courier, isMobile })

  const typeService = guide.quote.typeService === 'nextDay' ? 'Día siguiente' : 'Estándar'

  const isFedexProvider = guide.quote.courier === 'Fedex'
  const titleStyles = clsx(
    "text-base font-semibold text-gray-900 dark:text-white",
    { "place-self-end justify-self-start": isFedexProvider }
  )

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Guide image */}
        <CourierImage
          image={logoSrc}
          courier={guide.quote.courier}
          dataTestId="guide-db-logo"
          cssImgContainer="lg:col-span-2 place-self-center"
        />

        {/* Guide quote info */}
        <div data-testid="guide-title" className="lg:col-span-2">
          <span className="text-xs font-light text-blue-700 dark:text-blue-600">Paquetería</span>
          <h5 className={titleStyles}>
            {guide.quote.service}
          </h5>
          <span className="text-sm">{ typeService }</span>
        </div>

        {/* Guide content, price, provider and status */}
        <div className="lg:col-span-2 flex flex-wrap items-center gap-3 lg:flex-col lg:items-start">
          <span className="text-xs text-gray-600">Contenido: {guide.parcel.content}</span>
          <span className="font-semibold text-primary-700 dark:text-primary-400">{price}</span>
          <div className="flex gap-1">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-blue-900 dark:text-blue-200">
              {guide.provider}
            </span>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold",
                guide.status === 'created'
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}
            >
              {guide.status === 'created' ? '✓' : 'X'} {statusLabel}
            </span>
          </div>
        </div>

        {/* Guide address */}
        <AddressBlock guide={guide} type="origin" />
        <RiArrowRightLine className="hidden text-gray-600 dark:text-gray-300 lg:block" size={24} />
        <AddressBlock guide={guide} type="destination" />
      </div>
      <div className="w-full mt-3 flex justify-center">
        <button
          type="button"
          data-testid="guide-db-details-button"
          className={clsx(primaryButtonCSS)}
          onClick={() => onViewDetails(guide)}
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}

function AddressBlock({ guide, type }: { guide: GuideDbRecord; type: 'origin' | 'destination' }) {
  const address = guide[type]

  return (
    <div className="lg:col-span-2 min-w-0 text-sm flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
        {cityState(address.city, address.state) || 'N/A'}
      </p>
      <p className="mt-1 text-xs font-medium text-primary-700 dark:text-primary-400">{address.alias || 'Sin alias'}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{address.name || 'N/A'}</p>
      <p className="text-xs text-gray-700 dark:text-gray-300">
        {[address.street1, address.neighborhood, address.city, address.zipcode && `CP ${address.zipcode}`].filter(Boolean).join(', ')}
      </p>
    </div>
  )
}
