import { Badge, Button, Card } from "flowbite-react"
import { RiDeleteBinLine, RiMapPin2Line, RiPencilLine } from "@remixicon/react"

import { Address } from "@/shared/types/addresses.types"

interface AddressCardProps {
  address: Address
}

export const AddressCard = ({ address }: AddressCardProps) => {
  return (
    <Card className="max-w-sm">
      <div className="flex flex-col gap-3">
        <div className="inline-flex gap-2">
          <RiMapPin2Line />
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {address.alias}
          </h5>
        </div>
        { address.city.length === 1 && address.town.length === 1 && (
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 dark:text-gray-400">Dirección</p>
            <p>
              {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, {address.city?.[0]} {address.town?.[0]}, {address.state}, C.P. {address.postalCode}
            </p>
          </div>
        ) }
        { (address.city.length > 1 || address.town.length > 1) && (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-gray-400">Dirección</p>
              <p>
                {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, {address.state}, C.P. {address.postalCode}
              </p>
            </div>
            { address?.reference && (
              <div className="flex flex-col gap-1">
                <p className="text-gray-500 dark:text-gray-400">Referencia</p>
                <p>
                  {address.reference}
                </p>
            </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-gray-400">Ciudades</p>
              <div className="flex gap-3 flex-wrap">
                { address.city.map((city) => (
                  <Badge color="info" size="xs" key={city}>{city}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-gray-400">Municipios</p>
              <div className="flex gap-3 flex-wrap">
                { address.town.map((town) => (
                  <Badge color="success" size="xs" key={town}>{town}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex justify-between gap-3">
          <Button className="border-0 inline-flex gap-2" outline>
            <RiPencilLine size={18} />
            Editar
          </Button>
          <Button className="border-0 inline-flex gap-2 text-red-700" outline>
            <RiDeleteBinLine size={18} />
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  )
}