import { Button, Spinner } from "flowbite-react"

import { CreateGuideFormValues, CreateGuideMnPayload, SearchProduct } from "@/shared/types/guides.types"
import { QuoteUI } from "@/shared/types/quotes.types";
import { formatPhoneNumber, formatNumberToCurrency } from "@/shared/utils/global.utils"
import { verifyAndUpdateAddressMn } from "@/shared/utils/guides.utils"
import { RiCheckboxMultipleBlankLine, RiEditBoxLine, RiMailLine, RiMapPin3Line, RiMapPinLine, RiMoneyDollarCircleLine, RiOrganizationChart, RiPhoneLine, RiUserLine } from "@remixicon/react";

interface ConfirmGuideDataProps {
  formData: CreateGuideFormValues;
  selectedProduct: SearchProduct | null;
  selectedQuotes: QuoteUI[];
  isPending: boolean;
  goPrev: () => void
  createGuide: (payload: CreateGuideMnPayload) => void;
}

export const ConfirmGuideData = ({ formData, selectedProduct, selectedQuotes, isPending, goPrev, createGuide }: ConfirmGuideDataProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  const handleSubmit = () => {
    const quoteId = selectedQuotes?.[0]?.id
    const satProductId = selectedProduct?.code ?? ''
    
    // Verify and update addresses with default values for empty optional fields
    const verifiedOriginAddress = verifyAndUpdateAddressMn(originAddress)
    const verifiedDestinationAddress = verifyAndUpdateAddressMn(destinationAddress)
    
    const payload: CreateGuideMnPayload = {
      quoteId,
      origin: {
        ...verifiedOriginAddress,
        country: 'MX'
      },
      destination: {
        ...verifiedDestinationAddress,
        country: 'MX'
      },
      parcel: {
        ...parcelInfo,
        satProductId,
      }
    }
    createGuide(payload)
  }

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Remitente</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiUserLine size={18} />
            {originAddress.name}
          </li>
          <li className="ml-6 text-base inline-flex gap-2">
            <RiPhoneLine size={18} />
            {formatPhoneNumber(originAddress.phone)}
          </li>
          { originAddress.email && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiMailLine size={18} />
              {originAddress.email}
            </li>
          )}
          { originAddress.company && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiOrganizationChart size={18} />
              {originAddress.company}
            </li>
          )}
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {originAddress.street1} {originAddress.external_number}, {originAddress.neighborhood}, {originAddress.city} {originAddress.state}
          </li>
          { originAddress.reference && (
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
            {destinationAddress.name}
          </li>
          <li className="ml-6 text-base inline-flex gap-2">
            <RiPhoneLine size={18} />
            {formatPhoneNumber(destinationAddress.phone)}
          </li>
          { destinationAddress.email && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiMailLine size={18} />
              {destinationAddress.email}
            </li>
          )}
          { destinationAddress.company && (
            <li className="ml-6 text-base inline-flex gap-2">
              <RiOrganizationChart size={18} />
              {destinationAddress.company}
            </li>
          )}
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {destinationAddress.street1} {destinationAddress.external_number}, {destinationAddress.neighborhood}, {destinationAddress.city} {destinationAddress.state}
          </li>
          { destinationAddress.reference && (
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
          <li className="ml-6 inline-flex gap-2">
            <RiMoneyDollarCircleLine size={18} />
            Valor: {formatNumberToCurrency(parcelInfo.value)}
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiCheckboxMultipleBlankLine size={18} />
            Cantidad: {parcelInfo.quantity}
          </li>
        </ul>
      </article>
      <footer className="flex justify-between">
        <Button color="light" data-testid="confirm-guide-cancel-button" className="hover:cursor-pointer" onClick={goPrev}>
          Regresar
        </Button>
        <Button onClick={handleSubmit} data-testid="confirm-guide-send-button" className="hover:cursor-pointer">
          { isPending ? (<Spinner aria-label="loading create guide Kraft" />) : "Crear guia" }
        </Button>
      </footer>
    </section>
  )
}