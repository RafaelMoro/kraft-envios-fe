import { RiArrowLeftLine } from "@remixicon/react"
import clsx from "clsx"

import { GuideDbRecord } from "@/shared/types/guides.types"
import { formatDateToSpanish, getGuideDbFailureMessage, getGuideDbStatusLabel } from "@/shared/utils/guides.utils"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { greySecondaryCSS } from "@/shared/constants/global.constants"
import { DEFAULT_COMPANY_NAME, DEFAULT_EMAIL_VALUE } from "@/shared/constants/addresses.constants"
import {
  GUIDES_DB_DELETED_MESSAGE,
  GUIDES_DB_INTERNAL_PRICING_FIELDS,
  GUIDES_DB_INTERNAL_PRICING_SECTION_TITLE,
  GUIDES_DB_INTERNAL_PRICING_SOURCE_LABELS,
} from "@/shared/constants/guides.constants"

const cityState = (city: string, state: string) => [city, state].filter(Boolean).join(', ')
const typeServiceLabel = (typeService: GuideDbRecord['quote']['typeService']) =>
  typeService === 'nextDay' ? 'Día siguiente' : typeService === 'standard' ? 'Estándar' : '—'
const dash = '—'

const cardShell = "rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
const labelCls = "text-xs font-medium text-gray-600 dark:text-gray-400"
const valueCls = "text-base font-semibold text-gray-900 dark:text-white"
const pillBase = "rounded-full px-3 py-1 text-xs font-semibold"

interface GuideDbDetailsProps {
  guide: GuideDbRecord
  onBack: () => void
}

export const GuideDbDetails = ({ guide, onBack }: GuideDbDetailsProps) => {
  const createdAt = new Date(guide.createdAt)
  const updatedAt = new Date(guide.updatedAt)
  const createdDate = formatDateToSpanish(createdAt)
  const updatedDate = formatDateToSpanish(updatedAt)
  const price = formatNumberToCurrency(Number(guide.price ?? guide.quote.total))
  const failureMessage = getGuideDbFailureMessage(guide.failureInfo)
  const statusLabel = getGuideDbStatusLabel(guide.status)
  const parcel = guide.parcel
  const parcelDims = `${parcel.length} × ${parcel.width} × ${parcel.height}`

  const statusLabelCss = clsx(
    pillBase,
    { "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": guide.status === 'created' },
    { "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": guide.status === 'failed' }
  )

  const hasInternalPricing =
    guide.quote.qBaseRef != null ||
    guide.quote.qAdjFactor != null ||
    guide.quote.qAdjBasis != null ||
    guide.quote.qAdjMode != null ||
    guide.quote.qAdjSrcRef != null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-testid="guide-db-details-back-button"
          onClick={onBack}
          className={clsx(greySecondaryCSS, "inline-flex items-center gap-2")}
        >
          <RiArrowLeftLine size={18} />
          Volver a guías
        </button>
      </div>

      <article data-testid="guide-db-details-header" className={clsx(cardShell, "flex flex-col gap-3")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-mono text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
            {guide.kraftId}
          </span>
          <span
            className={statusLabelCss}
          >
            {guide.status === 'created' ? '✓' : 'X'} {statusLabel}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-blue-900 dark:text-blue-200">
            {guide.provider}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Envío de: {guide.origin.name || dash} → {guide.destination.name || dash}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {guide.quote.service} · {typeServiceLabel(guide.quote.typeService)} · Creado el {createdDate.date}, {createdDate.time} hrs
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span>No. de envío: {guide.shipmentNumber ?? dash}</span>
              <span>ID externo: {guide.externalId ?? dash}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={labelCls}>COTIZACIÓN</span>
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">{price}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{guide.quote.service} · {typeServiceLabel(guide.quote.typeService)}</span>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          testId="guide-db-details-summary-card"
          label="PAQUETE"
          value={parcel.content}
          subline={`${parcel.quantity ?? 1} pza · ${parcel.weight} kg · ${parcelDims} cm`}
        />
        <SummaryCard
          testId="guide-db-details-summary-card"
          label="SERVICIO"
          value={guide.quote.service}
          subline={typeServiceLabel(guide.quote.typeService)}
        />
        <SummaryCard
          testId="guide-db-details-summary-card"
          label="VALOR DECLARADO"
          value={formatNumberToCurrency(parcel.value ?? 0) || `$${(parcel.value ?? 0).toFixed(2)}`}
          subline={`SAT ${parcel.satProductId}`}
        />
        <SummaryCard
          testId="guide-db-details-summary-card"
          label="ACTUALIZADO"
          value={updatedDate.date ?? dash}
          subline={`${updatedDate.time ?? dash} hrs`}
        />
      </div>

      <article className={cardShell}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide text-gray-900 dark:text-white">RUTA</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <AddressBlock address={guide.origin} kind="origin" />
          <RiArrowLeftLine className="hidden -scale-x-100 self-center text-gray-500 dark:text-gray-400 lg:block" size={24} />
          <AddressBlock address={guide.destination} kind="destination" />
        </div>
      </article>

      <article className={cardShell}>
        <h3 className="mb-3 text-sm font-bold tracking-wide text-gray-900 dark:text-white">PAQUETE</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Detail label="CONTENIDO" value={parcel.content} />
          <Detail label="CANTIDAD" value={`${parcel.quantity ?? 1} pza(s)`} />
          <Detail label="PESO" value={`${parcel.weight} kg`} />
          <Detail label="DIMENSIONES (CM)" value={parcelDims} />
          <Detail label="VALOR DECLARADO" value={formatNumberToCurrency(parcel.value ?? 0) || `$${(parcel.value ?? 0).toFixed(2)}`} />
          <Detail label="SAT PRODUCTO" value={parcel.satProductId} />
        </div>
      </article>

      <article className={cardShell}>
        <h3 className="mb-3 text-sm font-bold tracking-wide text-gray-900 dark:text-white">COTIZACIÓN</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Detail label="SERVICIO" value={guide.quote.service} />
          <Detail label="TIPO DE SERVICIO" value={typeServiceLabel(guide.quote.typeService)} />
          <Detail label="TOTAL" value={formatNumberToCurrency(guide.quote.total)} accent />
          <Detail label="ID DE COTIZACIÓN" value={guide.quote.id} mono />
        </div>
      </article>

      { hasInternalPricing && (
        <article data-testid="guide-db-details-internal-pricing" className={cardShell}>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-gray-900 dark:text-white">{GUIDES_DB_INTERNAL_PRICING_SECTION_TITLE}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            { guide.quote.qBaseRef != null && (
              <Detail label={GUIDES_DB_INTERNAL_PRICING_FIELDS.qBaseRef} value={formatNumberToCurrency(guide.quote.qBaseRef)} />
            ) }
            { guide.quote.qAdjFactor != null && (
              <Detail label={GUIDES_DB_INTERNAL_PRICING_FIELDS.qAdjFactor} value={formatNumberToCurrency(guide.quote.qAdjFactor)} />
            ) }
            { guide.quote.qAdjBasis != null && (
              <Detail
                label={GUIDES_DB_INTERNAL_PRICING_FIELDS.qAdjBasis}
                value={guide.quote.qAdjMode?.toUpperCase() === 'P'
                  ? `${guide.quote.qAdjBasis}%`
                  : formatNumberToCurrency(guide.quote.qAdjBasis)}
              />
            ) }
            { guide.quote.qAdjMode != null && (
              <Detail label={GUIDES_DB_INTERNAL_PRICING_FIELDS.qAdjMode} value={guide.quote.qAdjMode} />
            ) }
            { guide.quote.qAdjSrcRef != null && (
              <Detail
                label={GUIDES_DB_INTERNAL_PRICING_FIELDS.qAdjSrcRef}
                value={GUIDES_DB_INTERNAL_PRICING_SOURCE_LABELS[guide.quote.qAdjSrcRef]}
              />
            ) }
          </div>
        </article>
      ) }

      { guide.status === 'failed' && guide.failureInfo && (
        <article data-testid="guide-db-details-error" className="rounded-lg border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-red-800 dark:text-red-300">ERROR DE CREACIÓN</h3>
          <div className="flex flex-col gap-1 text-sm text-red-800 dark:text-red-200">
            <div>
              <span className="font-semibold">{failureMessage}</span>
            </div>
            { guide.failureInfo.timestamp && (
              <span className="text-xs text-red-700 dark:text-red-300">
                {formatDateToSpanish(new Date(guide.failureInfo.timestamp)).fullDateTime} hrs
              </span>
            )}
          </div>
        </article>
      ) }

      { guide.deletedAt != null && (
        <article data-testid="guide-db-details-deleted" className="rounded-lg border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-amber-800 dark:text-amber-300">GUÍA ELIMINADA</h3>
          <div className="flex flex-col gap-1 text-sm text-amber-800 dark:text-amber-200">
            <span>
              {GUIDES_DB_DELETED_MESSAGE
                .replace('{date}', formatDateToSpanish(new Date(guide.deletedAt)).date)
                .replace('{deletedBy}', guide.deletedBy ?? '—')}
            </span>
          </div>
        </article>
      ) }
    </section>
  )
}

const SummaryCard = ({ label, value, subline, testId }: { label: string; value: string; subline?: string; testId?: string }) => (
  <div data-testid={testId} className={clsx(cardShell, "flex flex-col gap-1")}>
    <span className={labelCls}>{label}</span>
    <span className={valueCls}>{value}</span>
    { subline && <span className="text-xs text-gray-500 dark:text-gray-400">{subline}</span> }
  </div>
)

const Detail = ({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className={labelCls}>{label}</span>
    <span className={clsx(accent ? "text-base font-semibold text-primary-700 dark:text-primary-400" : valueCls, mono && "font-mono text-sm break-all")}>
      {value}
    </span>
  </div>
)

const AddressBlock = ({ address, kind }: { address: GuideDbRecord['origin']; kind: 'origin' | 'destination' }) => {
  const dotColor = kind === 'origin' ? 'bg-primary-700' : 'bg-green-600'
  const label = kind === 'origin' ? 'ORIGEN' : 'DESTINO'
  const aliasColor = kind === 'origin' ? 'text-primary-700 dark:text-primary-400' : 'text-green-700 dark:text-green-400'

  return (
    <div className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        <span className={clsx("inline-block h-2 w-2 rounded-full", dotColor)} />
        {label}
      </div>
      <span className={clsx("text-xs font-medium", aliasColor)}>{address.alias || 'Sin alias'}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{address.name || 'N/A'}</span>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {[address.street1, address.external_number && `#${address.external_number}`, address.neighborhood, cityState(address.city, address.state), address.zipcode && `CP ${address.zipcode}`].filter(Boolean).join(', ')}
      </span>
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
        { address.email && address.email !== DEFAULT_EMAIL_VALUE && <span>{address.email}</span> }
        { address.phone && <span>{address.phone}</span> }
        { address.company && address.company !== DEFAULT_COMPANY_NAME && <span>{address.company}</span> }
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">Ref.: {address.reference || 'Sin referencia'}</span>
    </div>
  )
}
