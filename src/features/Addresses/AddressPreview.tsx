import { RiMapPin2Line } from "@remixicon/react"
import { Address } from "@/shared/types/addresses.types"

interface AddressPreviewProps {
  address: Address
}

export const AddressPreview = ({ address }: AddressPreviewProps) => {
  return (
    <article className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-[auto_1fr] gap-2 grid-rows-[auto_1fr]">
        <div className="row-span-2 self-center">
          <RiMapPin2Line />
        </div>
          <h5 className="text-lg font-bold">
            {address.alias}
          </h5>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {address.addressName}, {address.externalNumber}{address.internalNumber ? `, Int. ${address.internalNumber}` : ''}, {address.neighborhood}, { address.city?.length === 1 && address.city?.[0]} { address.town?.length === 1 && address.town?.[0]}, {address.state}, C.P. {address.zipcode}
          </p>
      </div>
    </article>
  )
}