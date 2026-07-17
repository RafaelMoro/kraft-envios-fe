import { Alert, Button, Spinner } from "flowbite-react"
import {
  RiEditBoxLine,
  RiMailLine,
  RiMapPin3Line,
  RiMapPinLine,
  RiOrganizationChart,
  RiPhoneLine,
  RiUserLine,
} from "@remixicon/react"

import {
  CreateGuideAddressFormValuesMn,
  CreateGuideDbFormValues,
  UpdateGuideDbPayload,
} from "@/shared/types/guides.types"
import { GUIDES_DB_EDIT_NO_CHANGES_MESSAGE } from "@/shared/constants/guides.constants"
import { formatPhoneNumber } from "@/shared/utils/global.utils"

type ConfirmGuideDbEditDataProps = {
  originAddress: CreateGuideAddressFormValuesMn
  destinationAddress: CreateGuideAddressFormValuesMn
  parcelInfo: CreateGuideDbFormValues['parcelInfo']
  satProductLabel: string
  changedSections: (keyof UpdateGuideDbPayload)[]
  isDeleted: boolean
  isPending: boolean
  noChangesDismissed: boolean
  dismissNoChanges: () => void
  goPrev: () => void
  onSubmit: () => void
}

const AddressDetails = ({ address }: { address: CreateGuideAddressFormValuesMn }) => (
  <ul className="grid grid-cols-1 gap-2">
    <li className="ml-6 inline-flex gap-2"><RiUserLine size={18} />{`${address.name} ${address.lastName}`.trim()}</li>
    <li className="ml-6 inline-flex gap-2"><RiPhoneLine size={18} />{formatPhoneNumber(address.phone)}</li>
    {address.email && <li className="ml-6 inline-flex gap-2"><RiMailLine size={18} />{address.email}</li>}
    {address.company && <li className="ml-6 inline-flex gap-2"><RiOrganizationChart size={18} />{address.company}</li>}
    <li className="ml-6 inline-flex gap-2"><RiMapPinLine size={18} />{address.street1} {address.external_number}, {address.neighborhood}, {address.city} {address.state}</li>
    {address.reference && <li className="ml-6 inline-flex gap-2"><RiMapPin3Line size={18} />{address.reference}</li>}
  </ul>
)

export const ConfirmGuideDbEditData = ({
  originAddress,
  destinationAddress,
  parcelInfo,
  satProductLabel,
  changedSections,
  isDeleted,
  isPending,
  noChangesDismissed,
  dismissNoChanges,
  goPrev,
  onSubmit,
}: ConfirmGuideDbEditDataProps) => {
  const hasChanged = changedSections.length > 0
  const canSubmit = hasChanged && !isDeleted && !isPending

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-bold text-center">Confirmar cambios</h4>
      {isDeleted && <Alert color="failure">Esta guía fue eliminada y ya no puede editarse.</Alert>}
      {!hasChanged && !noChangesDismissed && (
        <Alert color="info" onDismiss={dismissNoChanges}>
          {GUIDES_DB_EDIT_NO_CHANGES_MESSAGE}
        </Alert>
      )}
      {changedSections.includes('origin') && (
        <article className="flex flex-col gap-4">
          <h5 className="text-lg font-bold">Remitente</h5>
          <AddressDetails address={originAddress} />
        </article>
      )}
      {changedSections.includes('destination') && (
        <article className="flex flex-col gap-4">
          <h5 className="text-lg font-bold">Destinatario</h5>
          <AddressDetails address={destinationAddress} />
        </article>
      )}
      {changedSections.includes('parcel') && (
        <article className="flex flex-col gap-4">
          <h5 className="text-lg font-bold">Paquete</h5>
          <ul className="grid grid-cols-1 gap-2">
            <li className="ml-6 inline-flex gap-2"><RiEditBoxLine size={18} />Descripción: {parcelInfo.content}</li>
            <li className="ml-6 inline-flex gap-2">Tipo de producto: {satProductLabel}</li>
          </ul>
        </article>
      )}
      <footer className="flex justify-between">
        <Button color="light" onClick={goPrev}>Regresar</Button>
        <Button onClick={onSubmit} disabled={!canSubmit}>
          {isPending ? <Spinner aria-label="loading update guide db" /> : 'Editar'}
        </Button>
      </footer>
    </section>
  )
}
