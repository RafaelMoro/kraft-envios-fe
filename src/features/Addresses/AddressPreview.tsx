import { Address } from "@/shared/types/addresses.types"
import { RiMapPin2Line } from "@remixicon/react"
import { Card } from "flowbite-react"

interface AddressPreviewProps {
  address: Address
}

export const AddressPreview = ({ address }: AddressPreviewProps) => {
  return (
    <Card>
      <div className="grid grid-cols-2 grid-rows-2">
        <div className="row-span-2">
          <RiMapPin2Line />
        </div>
          <h5 className="text-lg font-bold">
            {address.alias}
          </h5>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, { address.city?.length === 1 && address.city?.[0]} { address.town?.length === 1 && address.town?.[0]}, {address.state}, C.P. {address.zipcode}
          </p>
      </div>
    </Card>
  )
}