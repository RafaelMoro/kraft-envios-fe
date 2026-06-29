import { Button, Spinner } from "flowbite-react"

import {
  CreateGuideAddressFormValuesMn,
  CreateGuideDbFormValues,
  CreateGuideDbPayload,
  PackageDimensions,
  SearchProduct,
} from "@/shared/types/guides.types"
import { QuoteUI } from "@/shared/types/quotes.types"
import { formatPhoneNumber } from "@/shared/utils/global.utils"
import { toGuideDbParcelPayload } from "@/shared/utils/guides.utils"
import {
  RiCheckboxMultipleBlankLine,
  RiEditBoxLine,
  RiMailLine,
  RiMapPin3Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiOrganizationChart,
  RiPhoneLine,
  RiUserLine,
} from "@remixicon/react"

interface ConfirmGuideDbDataProps {
  originAddress: CreateGuideAddressFormValuesMn
  destinationAddress: CreateGuideAddressFormValuesMn
  originAlias: string
  originTown: string
  originZipcode: string
  destinationAlias: string
  destinationTown: string
  destinationZipcode: string
  parcelInfo: CreateGuideDbFormValues['parcelInfo']
  selectedQuote: QuoteUI
  packageDimensions: PackageDimensions | null
  selectedProduct: SearchProduct | null
  isPending: boolean
  goPrev: () => void
  onSubmit: (payload: CreateGuideDbPayload) => void
}

export const ConfirmGuideDbData = ({
  originAddress,
  destinationAddress,
  originAlias,
  originTown,
  originZipcode,
  destinationAlias,
  destinationTown,
  destinationZipcode,
  parcelInfo,
  selectedQuote,
  packageDimensions,
  selectedProduct,
  isPending,
  goPrev,
  onSubmit,
}: ConfirmGuideDbDataProps) => {
  const handleSubmit = () => {
    if (!selectedProduct) return
    const parcel = toGuideDbParcelPayload(packageDimensions, parcelInfo, selectedProduct.code)
    if (!parcel) return

    const payload: CreateGuideDbPayload = {
      provider: selectedQuote.source,
      quoteId: selectedQuote.id,
      origin: {
        alias: originAlias,
        name: `${originAddress.name} ${originAddress.lastName}`.trim(),
        lastName: originAddress.lastName ?? '',
        phone: originAddress.phone ?? '',
        email: originAddress.email ?? '',
        company: originAddress.company ?? '',
        street1: originAddress.street1 ?? '',
        external_number: originAddress.external_number ?? '',
        neighborhood: originAddress.neighborhood ?? '',
        city: originAddress.city ?? '',
        town: originTown,
        state: originAddress.state ?? '',
        zipcode: originZipcode,
        country: 'MX',
        reference: originAddress.reference ?? '',
      },
      destination: {
        alias: destinationAlias,
        name: `${destinationAddress.name} ${destinationAddress.lastName}`.trim(),
        lastName: destinationAddress.lastName ?? '',
        phone: destinationAddress.phone ?? '',
        email: destinationAddress.email ?? '',
        company: destinationAddress.company ?? '',
        street1: destinationAddress.street1 ?? '',
        external_number: destinationAddress.external_number ?? '',
        neighborhood: destinationAddress.neighborhood ?? '',
        city: destinationAddress.city ?? '',
        town: destinationTown,
        state: destinationAddress.state ?? '',
        zipcode: destinationZipcode,
        country: 'MX',
        reference: destinationAddress.reference ?? '',
      },
      parcel,
      notifyMe: parcelInfo.notifyMe,
    }
    onSubmit(payload)
  }

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-2">
        <h5 className="text-lg font-bold">Cotización</h5>
        <ul className="grid grid-cols-1 gap-1">
          <li>Origen: {selectedQuote.source}</li>
          <li>Servicio: {selectedQuote.service}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Remitente</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiUserLine size={18} />
            {`${originAddress.name} ${originAddress.lastName}`.trim()}
          </li>
          <li className="ml-6 text-base inline-flex gap-2">
            <RiPhoneLine size={18} />
            {formatPhoneNumber(originAddress.phone)}
          </li>
          {originAddress.email && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiMailLine size={18} />
              {originAddress.email}
            </li>
          )}
          {originAddress.company && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiOrganizationChart size={18} />
              {originAddress.company}
            </li>
          )}
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {originAddress.street1} {originAddress.external_number}, {originAddress.neighborhood}, {originAddress.city} {originAddress.state}
          </li>
          {originAddress.reference && (
            <li className="ml-6 text-base">
              <RiMapPin3Line size={18} />
              {originAddress.reference}
            </li>
          )}
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Destinatario</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiUserLine size={18} />
            {`${destinationAddress.name} ${destinationAddress.lastName}`.trim()}
          </li>
          <li className="ml-6 text-base inline-flex gap-2">
            <RiPhoneLine size={18} />
            {formatPhoneNumber(destinationAddress.phone)}
          </li>
          {destinationAddress.email && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiMailLine size={18} />
              {destinationAddress.email}
            </li>
          )}
          {destinationAddress.company && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiOrganizationChart size={18} />
              {destinationAddress.company}
            </li>
          )}
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {destinationAddress.street1} {destinationAddress.external_number}, {destinationAddress.neighborhood}, {destinationAddress.city} {destinationAddress.state}
          </li>
          {destinationAddress.reference && (
            <li className="ml-6 text-base">
              <RiMapPin3Line size={18} />
              {destinationAddress.reference}
            </li>
          )}
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Paquete</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiEditBoxLine size={18} />
            Descripción: {parcelInfo.content}
          </li>
          {parcelInfo.value && (
            <li className="ml-6 inline-flex gap-2">
              <RiMoneyDollarCircleLine size={18} />
              Valor: {parcelInfo.value}
            </li>
          )}
          {parcelInfo.quantity && (
            <li className="ml-6 inline-flex gap-2">
              <RiCheckboxMultipleBlankLine size={18} />
              Cantidad: {parcelInfo.quantity}
            </li>
          )}
          {parcelInfo.notifyMe && (
            <li className="ml-6 inline-flex gap-2 text-sm text-gray-600">
              Notificarme: activado
            </li>
          )}
        </ul>
      </article>
      <footer className="flex justify-between">
        <Button color="light" data-testid="confirm-guide-db-cancel-button" className="hover:cursor-pointer" onClick={goPrev}>
          Regresar
        </Button>
        <Button onClick={handleSubmit} data-testid="confirm-guide-db-send-button" className="hover:cursor-pointer">
          {isPending ? (<Spinner aria-label="loading create guide db" />) : 'Crear guía'}
        </Button>
      </footer>
    </section>
  )
}
