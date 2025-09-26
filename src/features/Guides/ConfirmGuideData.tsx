import { GeneralApiError } from "@/shared/types/global.types";
import { CreateGuideFormValues, CreateGuideMnPayload, SearchProduct } from "@/shared/types/guides.types"
import { QuoteUI } from "@/shared/types/quotes.types";
import { formatPhoneNumber, formatNumberToCurrency } from "@/shared/utils/global.utils"
import { createGuideMnCb } from "@/shared/utils/guides.utils";
import { useMutation } from "@tanstack/react-query";
import { Button } from "flowbite-react"

interface ConfirmGuideDataProps {
  formData: CreateGuideFormValues;
  selectedProduct: SearchProduct | null;
  selectedQuotes: QuoteUI[];
  goPrev: () => void
}

export const ConfirmGuideData = ({ formData, selectedProduct, selectedQuotes, goPrev }: ConfirmGuideDataProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  // TODO: Change any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutate: createGuide, data } = useMutation<any, GeneralApiError, CreateGuideMnPayload>({
    mutationFn: createGuideMnCb,
  })
  console.log('data from confirm data guide', data)

  const handleSubmit = () => {
    const quoteId = selectedQuotes?.[0]?.id
    const satProductId = selectedProduct?.code ?? ''
    const payload: CreateGuideMnPayload = {
      quoteId,
      origin: {
        ...originAddress,
        country: 'MX'
      },
      destination: {
        ...destinationAddress,
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
        <h5 className="text-lg font-bold">Datos del remitente</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Nombre de la persona: {originAddress.name}</li>
          <li className="ml-6 text-base">Teléfono de contacto: {formatPhoneNumber(originAddress.phone)}</li>
          <li className="ml-6 text-base">Correo electrónico: {originAddress.email}</li>
          <li className="ml-6 text-base">Nombre de la compañia: {originAddress.company}</li>
          <li className="ml-6 text-base">Domicilio: {originAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {originAddress.neighborhood}</li>
          <li className="ml-6 text-base">Numero exterior: {originAddress.external_number}</li>
          <li className="ml-6 text-base">Ciudad: {originAddress.city}</li>
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
          <li className="ml-6 text-base">Nombre de la compañia: {destinationAddress.company}</li>
          <li className="ml-6 text-base">Domicilio: {destinationAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {destinationAddress.neighborhood}</li>
          <li className="ml-6 text-base">Numero exterior: {destinationAddress.external_number}</li>
          <li className="ml-6 text-base">Ciudad: {destinationAddress.city}</li>
          <li className="ml-6 text-base">Estado: {destinationAddress.state}</li>
          <li className="ml-6 text-base">Referencia del domicilio: {destinationAddress.reference}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Información del paquete</h5>
        <ul className="grid grid-cols-1 gap-2 list-disc">
          <li className="ml-6">Descripción del contenido del paquete: {parcelInfo.content}</li>
          <li className="ml-6">Valor del paquete: {formatNumberToCurrency(parcelInfo.value)}</li>
          <li className="ml-6">Cantidad: {parcelInfo.quantity}</li>
        </ul>
      </article>
      <footer className="flex justify-between">
        <Button color="light" data-testid="confirm-guide-cancel-button" className="hover:cursor-pointer" onClick={goPrev}>
          Regresar
        </Button>
        <Button onClick={handleSubmit} data-testid="confirm-guide-send-button" className="hover:cursor-pointer">
          Crear guia
        </Button>
      </footer>
    </section>
  )
}