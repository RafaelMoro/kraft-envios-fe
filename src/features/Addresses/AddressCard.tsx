import { Badge, Button } from "flowbite-react"
import { RiDeleteBinLine, RiMapPin2Line, RiPencilLine } from "@remixicon/react"

import { Address } from "@/shared/types/addresses.types"

interface AddressCardProps {
  address: Address;
  handleDeleteAddress: (addressAlias: string) => void
  handleEditAddress: (addressToEdit: Address) => void
}

export const AddressCard = ({ address, handleDeleteAddress, handleEditAddress }: AddressCardProps) => {
  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 max-w-sm p-4">
      <div className="h-full flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-5">
          <div className="inline-flex gap-2">
            <RiMapPin2Line />
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {address.alias}
            </h5>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 dark:text-gray-400">Dirección</p>
            <p>
              {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, { address.city?.length === 1 && address.city?.[0]} { address.town?.length === 1 && address.town?.[0]}, {address.state}, C.P. {address.zipcode}
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
          { address?.isGEAddress && (
            <div className="w-fit">
              <Badge color="pink" size="xs" className="">
                Dirección creada en GE
              </Badge>
            </div>
          )}
          { (address.city.length > 1 || address.town.length > 1) && (
            <>
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
        </div>
        <div className="flex justify-between gap-3">
          <Button onClick={() => handleEditAddress(address)} className="border-0 inline-flex gap-2" outline>
            <RiPencilLine size={18} />
            Editar
          </Button>
          <Button className="border-0 inline-flex gap-2" color="red" outline onClick={() => handleDeleteAddress(address?.alias)}>
            <RiDeleteBinLine size={18} />
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  )
}