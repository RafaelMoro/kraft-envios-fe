import { Button, Spinner } from "flowbite-react";
import { RiEditBoxLine, RiMailLine, RiMapPinLine, RiMenuSearchLine, RiRuler2Line, RiWeightLine } from "@remixicon/react";

import { CreateGuideFormValuesGE, CreateGuideGEPayload, SearchProduct } from "@/shared/types/guides.types"
import { QuoteUI } from "@/shared/types/quotes.types";
import { formatAddressForDisplay } from "@/shared/utils/addresses.utils";

interface ConfirmGuideGEProps {
  formData: CreateGuideFormValuesGE;
  selectedProduct: SearchProduct | null;
  selectedQuotes: QuoteUI[]
  isPending: boolean;
  goPrev: () => void
  createGuide: (payload: CreateGuideGEPayload) => void;
}

export const ConfirmGuideGE = ({ formData, selectedProduct, isPending, selectedQuotes, goPrev, createGuide }: ConfirmGuideGEProps) => {
  const { originAddress, destinationAddress, parcelInfo } = formData
  const originInformation = originAddress.information
  const destinationInformation = destinationAddress.information

  const handleSubmit = () => {
    const quoteId = selectedQuotes?.[0]?.id

    const payload: CreateGuideGEPayload = {
      quoteId,
      origin: originAddress.address,
      destination: destinationAddress.address,
      parcel: parcelInfo
    }
    createGuide(payload)
  }

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar datos</h4>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Remitente</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMailLine size={18} />
            {originAddress.address.alias}
          </li>
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {formatAddressForDisplay(originInformation)}
          </li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Datos del destinatario</h5>
        <li className="ml-6 text-base inline-flex gap-2">
          <RiMailLine size={18} />
          {destinationAddress.address.alias}
        </li>
        <li className="ml-6 text-base inline-flex gap-2">
          <RiMapPinLine />
          {formatAddressForDisplay(destinationInformation)}
        </li>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Paquete</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiEditBoxLine size={18} />
            Descripción: {parcelInfo.content}
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiMenuSearchLine size={18} />
            Tipo de producto: {selectedProduct?.description}
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiRuler2Line size={18} />
            Largo: {parcelInfo.length} cm
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiRuler2Line size={18} />
            Alto: {parcelInfo.height} cm
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiRuler2Line size={18} />
            Ancho: {parcelInfo.width} cm
          </li>
          <li className="ml-6 inline-flex gap-2">
            <RiWeightLine size={18} />
            Peso: {parcelInfo.weight} kg
          </li>
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