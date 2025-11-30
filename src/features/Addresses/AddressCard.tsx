import { Address } from "@/shared/types/addresses.types"
import { Card } from "flowbite-react"

interface AddressCardProps {
  address: Address
}

export const AddressCard = ({ address }: AddressCardProps) => {
  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {address.alias}
      </h5>
      <p className="font-normal text-gray-500 dark:text-gray-400">
        {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, {address.city.join(', ')}, {address.state}, C.P. {address.postalCode}
      </p>
    </Card>
  )
}