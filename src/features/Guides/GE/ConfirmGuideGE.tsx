import { CreateGuideFormValuesGE, SearchProduct } from "@/shared/types/guides.types"
import { Button, Spinner } from "flowbite-react";

interface ConfirmGuideGEProps {
  formData: CreateGuideFormValuesGE;
  selectedProduct: SearchProduct | null;
  isPending: boolean;
  goPrev: () => void
}

export const ConfirmGuideGE = ({ formData, selectedProduct, isPending, goPrev }: ConfirmGuideGEProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData

  const handleSubmit = () => {
    // Verify and update addresses with default values for empty optional fields
    // const verifiedOriginAddress = verifyAndUpdateAddressPkk(originAddress)
    // const verifiedDestinationAddress = verifyAndUpdateAddressPkk(destinationAddress)

    // const payload: CreateGuidePkkPayload = {
    //   origin: verifiedOriginAddress,
    //   destination: verifiedDestinationAddress,
    //   parcel: parcelInfo
    // }

    // createGuide(payload)
  }

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
          <li className="ml-6">Tipo de producto: {selectedProduct?.description}</li>
          <li className="ml-6">Largo del paquete: {parcelInfo.length} cm</li>
          <li className="ml-6">Alto del paquete: {parcelInfo.height} cm</li>
          <li className="ml-6">Ancho del paquete: {parcelInfo.width} cm</li>
          <li className="ml-6">Peso del paquete: {parcelInfo.weight} kg</li>
        </ul>
      </article>
      <footer className="flex justify-between">
        <Button color="light" data-testid="confirm-guide-cancel-button" className="hover:cursor-pointer" onClick={goPrev}>
          Regresar
        </Button>
        <Button
          onClick={handleSubmit}
          data-testid="confirm-guide-send-button"
          className="hover:cursor-pointer"
        >
          { isPending ? (<Spinner aria-label="loading create guide Kraft" />) : "Crear guia" }
        </Button>
      </footer>
    </section>
  )
}