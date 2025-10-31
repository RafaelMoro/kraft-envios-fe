import { CreateGuideFormValuesGE } from "@/shared/types/guides.types"

interface ConfirmGuideGEProps {
  formData: CreateGuideFormValuesGE
}

export const ConfirmGuideGE = ({ formData }: ConfirmGuideGEProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  return (
    <section className=" p-4 flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del remitente</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Alias del domicilio: {originAddress.alias}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del destinatario</h5>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 list-disc">
          <li className="ml-6">Alias del domicilio: {destinationAddress.alias}</li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Información del paquete</h5>
        <ul className="grid grid-cols-1 gap-2 list-disc">
          <li className="ml-6">Descripción del contenido del paquete: {parcelInfo.content}</li>
        </ul>
      </article>
    </section>
  )
}