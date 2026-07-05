import { RiArrowRightLine } from "@remixicon/react"
import clsx from "clsx"

import { primaryButtonCSS } from "@/shared/constants/global.constants"
import { GuideDbRecord } from "@/shared/types/guides.types"
import { getQuoteImg } from "@/shared/utils/quotes.utils"
import { getGuideDbStatusLabel } from "@/shared/utils/guides.utils"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { CourierImage } from "@/shared/ui/atoms/CourierImage"

const cityState = (city: string, state: string) => [city, state].filter(Boolean).join(', ')

const fullName = (name: string, lastName: string) => [name, lastName].filter(Boolean).join(' ')

export function GuideDbCard({ guide, isMobile }: { guide: GuideDbRecord; isMobile: boolean }) {
  const price = guide.price ? formatNumberToCurrency(Number(guide.price)) : formatNumberToCurrency(guide.quote.total)
  const statusLabel = getGuideDbStatusLabel(guide.status)
  const logoSrc = getQuoteImg({ courier: guide.quote.courier, isMobile })

  const typeService = guide.quote.typeService === 'nextDay' ? 'Día siguiente' : 'Estándar'

  // const isOtherProvider = guide.quote.courier === 'other'
  const isFedexProvider = guide.quote.courier === 'Fedex'
  const titleStyles = clsx(
    "text-base font-semibold text-gray-900 dark:text-white",
    { "place-self-end justify-self-start": isFedexProvider }
  )

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-5 lg:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_24px_minmax(0,1fr)_140px] lg:items-center">
        {/* Guide header */}
        <CourierImage
          image={logoSrc}
          courier={guide.quote.courier}
          dataTestId="guide-db-logo"
          cssImgContainer="h-12 w-12 shrink-0"
        />
        <div data-testid="guide-title">
          <span className="text-xs font-light text-blue-700 dark:text-blue-600">Paquetería</span>
          <h5 className={titleStyles}>
            {guide.quote.service}
          </h5>
          <span className="text-sm">{ typeService }</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-start">
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

        <div className="flex flex-col gap-2">
          {guide.labelUrl && (
            <a
              href={guide.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Etiqueta
            </a>
          )}
        </div>
      </div>
      <div className="w-full flex justify-center mt-5">
        <button type="button" className={clsx(primaryButtonCSS)}>Ver detalles</button>
      </div>
    </article>
  )
}

function AddressBlock({ guide, type }: { guide: GuideDbRecord; type: 'origin' | 'destination' }) {
  const address = guide[type]

  return (
    <div className="min-w-0 text-sm flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
        {cityState(address.city, address.state) || 'N/A'}
      </p>
      <p className="mt-1 text-xs font-medium text-primary-700 dark:text-primary-400">{address.alias || 'Sin alias'}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{fullName(address.name, address.lastName) || 'N/A'}</p>
      <p className="text-xs text-gray-700 dark:text-gray-300">
        {[address.street1, address.neighborhood, address.city, address.zipcode && `CP ${address.zipcode}`].filter(Boolean).join(', ')}
      </p>
    </div>
  )
}
