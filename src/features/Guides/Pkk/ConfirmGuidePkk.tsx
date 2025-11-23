import { CreateGuideFormValuesPkk, CreateGuidePkkPayload } from "@/shared/types/guides.types"
import { formatPhoneNumber } from "@/shared/utils/global.utils"
import { verifyAndUpdateAddressPkk } from "@/shared/utils/guides.utils"
import { RiEditBoxLine, RiMailLine, RiMapPinLine, RiPhoneLine, RiUserLine } from "@remixicon/react"
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
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {originAddress.street1}, {originAddress.neighborhood}, {originAddress.city} {originAddress.state}, {originAddress.zipcode}
          </li>
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
          <li className="ml-6 text-base inline-flex gap-2">
            <RiMapPinLine />
            {destinationAddress.street1}, {destinationAddress.neighborhood}, {destinationAddress.city} {destinationAddress.state}, {destinationAddress.zipcode}
          </li>
        </ul>
      </article>
      <article className="flex flex-col gap-4">
        <h5 className="text-lg font-bold">Paquete</h5>
        <ul className="grid grid-cols-1 gap-2">
          <li className="ml-6 inline-flex gap-2">
            <RiEditBoxLine size={18} />
            {parcelInfo.content}
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