import { CreateAddressGEPayload } from "@/shared/types/guides.types"
import { RiMapPinFill } from "@remixicon/react"
import { Button, Card } from "flowbite-react"

interface PendingAddressGEProps {
  address: CreateAddressGEPayload
}

export const PendingAddressGE = ({ address }: PendingAddressGEProps) => {
  return (
    <Card className="max-w-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
        <div className="inline-flex gap-2">
          <RiMapPinFill />
          <h4 className="text-lg">{address.alias}</h4>
        </div>
        <p className="text-sm text-gray-400 md:row-start-2 md:row-end-3">
          {address.street} {address.number}, {address.neighborhood}, {address.city} {address.state}, C.P. {address.zipcode}
        </p>
        <div className="md:row-span-2 place-self-center">
          <Button outline>Volver a intentar</Button>
        </div>
      </div>
    </Card>
  )
}