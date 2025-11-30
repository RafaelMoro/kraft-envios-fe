import { Badge, Card } from "flowbite-react"
import { RiBuildingLine, RiMap2Line } from "@remixicon/react"

import { Address } from "@/shared/types/addresses.types"

interface AddressCardProps {
  address: Address
}

export const AddressCard = ({ address }: AddressCardProps) => {
  return (
    <Card className="max-w-sm">
      <div className="flex flex-col gap-5">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {address.alias}
        </h5>
        { address.city.length === 1 && address.town.length === 1 && (
          <p className="text-gray-600 dark:text-gray-400">
            {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, {address.city?.[0]} {address.town?.[0]}, {address.state}, C.P. {address.postalCode}
          </p>
        ) }
        { (address.city.length > 1 || address.town.length > 1) && (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, {address.state}, C.P. {address.postalCode}
            </p>
            <div className="flex gap-3 flex-wrap">
              <RiBuildingLine size={18} />
              <span className="text-sm">Ciudades:</span>
              { address.city.map((city) => (
                <Badge color="info" size="xs" key={city}>{city}</Badge>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <RiMap2Line size={18} />
              <span className="text-sm">Municipios:</span>
              { address.town.map((town) => (
                <Badge color="success" size="xs" key={town}>{town}</Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}