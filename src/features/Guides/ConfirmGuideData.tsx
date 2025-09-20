import { CreateGuideFormValues } from "@/shared/types/guides.types"
import { Button } from "flowbite-react"

interface ConfirmGuideDataProps {
  formData: CreateGuideFormValues
  goPrev: () => void
}

export const ConfirmGuideData = ({ formData, goPrev }: ConfirmGuideDataProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del remitente</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6"><span className="font-semibold">Nombre de la persona:</span> {originAddress.name}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Teléfono de contacto:</span> {originAddress.phone}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Correo electrónico:</span> {originAddress.email}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Nombre de la compañia:</span> {originAddress.company}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Domicilio:</span> {originAddress.street1}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Colonia:</span> {originAddress.neighborhood}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Numero exterior:</span> {originAddress.external_number}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Ciudad:</span> {originAddress.city}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Estado:</span> {originAddress.state}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Referencia del domicilio:</span> {originAddress.reference}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del destinatario</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6"><span className="font-semibold">Nombre de la persona:</span> {destinationAddress.name}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Teléfono de contacto:</span> {destinationAddress.phone}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Correo electrónico:</span> {destinationAddress.email}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Nombre de la compañia:</span> {destinationAddress.company}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Domicilio:</span> {destinationAddress.street1}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Colonia:</span> {destinationAddress.neighborhood}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Numero exterior:</span> {destinationAddress.external_number}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Ciudad:</span> {destinationAddress.city}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Estado:</span> {destinationAddress.state}</li>
          <li className="ml-6 text-base"><span className="font-semibold">Referencia del domicilio:</span> {destinationAddress.reference}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Información del paquete</h5>
        <ul className="grid grid-cols-1 gap-2 list-disc">
          <li className="ml-6"><span className="font-semibold">Descripción del contenido del paquete:</span> {parcelInfo.content}</li>
          <li className="ml-6"><span className="font-semibold">Valor del paquete:</span> {parcelInfo.value}</li>
          <li className="ml-6"><span className="font-semibold">Cantidad:</span> {parcelInfo.quantity}</li>
        </ul>
      </article>
      <footer className="flex justify-between">
        <Button color="light" data-testid="confirm-guide-cancel-button" className="hover:cursor-pointer" onClick={goPrev}>
          Regresar
        </Button>
        <Button data-testid="confirm-guide-send-button" className="hover:cursor-pointer">
          Crear guia
        </Button>
      </footer>
    </section>
  )
}