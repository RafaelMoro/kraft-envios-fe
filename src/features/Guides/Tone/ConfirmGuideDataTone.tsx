import { Button, Spinner } from "flowbite-react"

import { CreateGuideFormValuesTone, CreateGuideTonePayload } from "@/shared/types/guides.types"
import { formatPhoneNumber } from "@/shared/utils/global.utils"
import { QuoteUI } from "@/shared/types/quotes.types"
import { verifyAndUpdateAddressTone } from "@/shared/utils/guides.utils"

interface ConfirmGuideDataToneProps {
  formData: CreateGuideFormValuesTone
  selectedQuotes: QuoteUI[]
  isPending: boolean;
  goPrev: () => void
  createGuide: (payload: CreateGuideTonePayload) => void;
}

export const ConfirmGuideDataTone = ({ formData, selectedQuotes, isPending, goPrev, createGuide }: ConfirmGuideDataToneProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  const handleSubmit = () => {
    const quoteId = selectedQuotes?.[0]?.id
    // Verify and update addresses with default values for empty optional fields
    const verifiedOriginAddress = verifyAndUpdateAddressTone(originAddress)
    const verifiedDestinationAddress = verifyAndUpdateAddressTone(destinationAddress)

    const payload: CreateGuideTonePayload = {
      quoteToken: quoteId,
      notifyMe: parcelInfo.notifyMe,
      origin: verifiedOriginAddress,
      destination: verifiedDestinationAddress,
      parcel: {
        content: parcelInfo.content,
      }
    }
    createGuide(payload)
  }

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del remitente</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Nombre de la persona: {originAddress.name}</li>
          <li className="ml-6 text-base">Teléfono de contacto: {formatPhoneNumber(originAddress.phone)}</li>
          <li className="ml-6 text-base">Correo electrónico: {originAddress.email}</li>
          <li className="ml-6 text-base">Domicilio: {originAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {originAddress.neighborhood}</li>
          <li className="ml-6 text-base">Numero exterior: {originAddress.external_number}</li>
          <li className="ml-6 text-base">Ciudad: {originAddress.town}</li>
          <li className="ml-6 text-base">Estado: {originAddress.state}</li>
          <li className="ml-6 text-base">Referencia del domicilio: {originAddress.reference}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del destinatario</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Nombre de la persona: {destinationAddress.name}</li>
          <li className="ml-6 text-base">Teléfono de contacto: {formatPhoneNumber(destinationAddress.phone)}</li>
          <li className="ml-6 text-base">Correo electrónico: {destinationAddress.email}</li>
          <li className="ml-6 text-base">Domicilio: {destinationAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {destinationAddress.neighborhood}</li>
          <li className="ml-6 text-base">Numero exterior: {destinationAddress.external_number}</li>
          <li className="ml-6 text-base">Ciudad: {destinationAddress.town}</li>
          <li className="ml-6 text-base">Estado: {destinationAddress.state}</li>
          <li className="ml-6 text-base">Referencia del domicilio: {destinationAddress.reference}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Información del paquete</h5>
        <ul className="grid grid-cols-1 gap-2 list-disc">
          <li className="ml-6">Descripción del contenido del paquete: {parcelInfo.content}</li>
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