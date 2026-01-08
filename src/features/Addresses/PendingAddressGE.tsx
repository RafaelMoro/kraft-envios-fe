import { CreateAddressGEPayload } from "@/shared/types/guides.types"
import { RiMapPinFill } from "@remixicon/react"
import { Button, Card } from "flowbite-react"

interface PendingAddressGEProps {
  address: CreateAddressGEPayload
}

export const PendingAddressGE = ({ address }: PendingAddressGEProps) => {
  return (
    <Card className="max-w-md">
      <div className="flex justify-between">
        <div className="inline-flex gap-2">
          <RiMapPinFill />
          <h4 className="text-lg">{address.alias}</h4>
        </div>
        <Button outline>Volver a intentar</Button>
      </div>
    </Card>
  )
}