import { CreateGuideFormValuesPkk, CreateGuidePkkPayload } from "@/shared/types/guides.types"
import { formatPhoneNumber } from "@/shared/utils/global.utils"
import { verifyAndUpdateAddressPkk } from "@/shared/utils/guides.utils"
import { Button, Spinner } from "flowbite-react"

interface ConfirmGuidePkkProps {
  formData: CreateGuideFormValuesPkk
  isPending: boolean;
  goPrev: () => void
  createGuide: (payload: CreateGuidePkkPayload) => void;
}

export const ConfirmGuidePkk = ({ formData, isPending, goPrev, createGuide }: ConfirmGuidePkkProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  const handleSubmit = () => {
    // Verify and update addresses with default values for empty optional fields
    const verifiedOriginAddress = verifyAndUpdateAddressPkk(originAddress)
    const verifiedDestinationAddress = verifyAndUpdateAddressPkk(destinationAddress)

    const payload: CreateGuidePkkPayload = {
      origin: verifiedOriginAddress,
      destination: verifiedDestinationAddress,
      parcel: parcelInfo
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
          { originAddress.email && (<li className="ml-6 text-base">Correo electrónico: {originAddress.email}</li>)}
          <li className="ml-6 text-base">Domicilio: {originAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {originAddress.neighborhood}</li>
          <li className="ml-6 text-base">Ciudad: {originAddress.city}</li>
          <li className="ml-6 text-base">Estado: {originAddress.state}</li>
          <li className="ml-6 text-base">Código Postal: {originAddress.zipcode}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del destinatario</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Nombre de la persona: {destinationAddress.name}</li>
          <li className="ml-6 text-base">Teléfono de contacto: {formatPhoneNumber(destinationAddress.phone)}</li>
          { destinationAddress.email && (<li className="ml-6 text-base">Correo electrónico: {destinationAddress.email}</li>)}
          <li className="ml-6 text-base">Domicilio: {destinationAddress.street1}</li>
          <li className="ml-6 text-base">Colonia: {destinationAddress.neighborhood}</li>
          <li className="ml-6 text-base">Ciudad: {destinationAddress.city}</li>
          <li className="ml-6 text-base">Estado: {destinationAddress.state}</li>
          <li className="ml-6 text-base">Código Postal: {destinationAddress.zipcode}</li>
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