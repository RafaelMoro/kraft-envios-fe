"use client"
import { useState } from "react"
import { Button, Card, CheckIcon, Spinner } from "flowbite-react"
import { RiMapPinFill } from "@remixicon/react"
import { useMutation } from "@tanstack/react-query"

import { CreateAddressGEPayload, CreateAddressGEResponse } from "@/shared/types/guides.types"
import { GeneralApiError } from "@/shared/types/global.types"
import { createAddressGECb } from "@/shared/utils/guides.utils"
import { removeAddressFromLocalStorage } from "@/shared/utils/addresses.utils"

interface PendingAddressGEProps {
  address: CreateAddressGEPayload
}

export const PendingAddressGE = ({ address }: PendingAddressGEProps) => {
  const [showError, setShowError] = useState(false)
  const { mutate: createAddressGE, isPending, isSuccess } = useMutation<CreateAddressGEResponse, GeneralApiError, CreateAddressGEPayload>({
    mutationFn: createAddressGECb,
    onSuccess: async () => {
      // Remove address from LS
      await removeAddressFromLocalStorage(address.alias)
    },
    onError: () => {
      // show error state
      setShowError(true)

      // after 3 seconds reset
      setTimeout(() => {
        setShowError(false)
      }, 3000)
    }
  })

  const handleSubmit = () => {
    createAddressGE(address)
  }

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
          <Button
            outline
            onClick={handleSubmit}
            disabled={isPending || isSuccess}
          >
            { (isSuccess) && (<CheckIcon ia-label="loading create address ge" />) }
            { (isPending) && (<Spinner aria-label="loading create address ge pending directions" />) }
            { !isSuccess && !isPending && 'Volver a intentar' }
          </Button>
        </div>
        { showError && (
          <p className="text-sm text-red-500 md:col-span-2">¡Ups! Ocurrió un problema al crear la dirección. Inténtalo más tarde.</p>
        )}
      </div>
    </Card>
  )
}