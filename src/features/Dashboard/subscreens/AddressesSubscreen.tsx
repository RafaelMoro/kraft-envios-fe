"use client"
import { useState } from "react"
import { Button } from "flowbite-react"

import { LoginData } from "@/shared/types/login.types"
import { CreateAddress } from "@/features/Addresses/CreateAddress"
import { useNotification } from "@/shared/hooks/useNotification"
import { Notification } from "@/shared/ui/atoms/Notification"
import { useQuery } from "@tanstack/react-query"
import { getAddressesCb } from "@/shared/utils/addresses.utils"
import { AddressCard } from "@/features/Addresses/AddressCard"
import { AddressCardSkeleton } from "@/features/Addresses/AddressCardSkeleton"
import { DeleteAddressModal } from "@/features/Addresses/DeleteAddressModal"
import Image from "next/image"

interface AddressesSubscreenProps {
  userInfo: LoginData | null
}

export const AddressesSubscreen = ({ userInfo }: AddressesSubscreenProps) => {
  // Create address states
  const [openCreateAddress, setOpenCreateAddress] = useState(false)
  const toggleModalCreateAddress = () => setOpenCreateAddress((prev) => !prev)

  // Delete address states
  const [selectedAddressAlias, setSelectedAddressAlias] = useState<string>("")
  const [openDeleteAddress, setOpenDeleteAddress] = useState(false)
  const toggleModalDeleteAddress = () => setOpenDeleteAddress((prev) => !prev)

  const {
    notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()

  const { data: addressesData, refetch, isPending, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesCb
  })

  const handleDeleteAddress = (addressAlias: string) => {
    setSelectedAddressAlias(addressAlias)
    toggleModalDeleteAddress()
  }

  const refetchAddresses = async () => {
    await refetch()
  }

  return (
    <main className='w-full p-4 flex flex-col gap-4'>
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center">Aquí puedes gestionar las direcciones que uses posteriormente para crear guías.</p>
      <div className="w-full flex justify-end">
        <Button onClick={toggleModalCreateAddress}>Crear dirección</Button>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        { (isPending && !addressesData) && Array.from({ length: 3 }).map((_, index) => (
          <AddressCardSkeleton key={index} />
        ))}
        { (!isPending && isError) && (
          <>
            <h2 className="text-2xl font-bold text-center tracking-tight md:col-span-2 lg:col-span-3">Oops!</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 md:col-span-2 lg:col-span-3">Ha sucedido un error. Intentelo nuevamente</p>
          </>
        )}
        { (addressesData && addressesData.length > 0 && !isPending) && addressesData.map((addr) => (
          <AddressCard key={addr.alias} address={addr} handleDeleteAddress={handleDeleteAddress} />
        )) }
        { (addressesData && addressesData.length === 0 && !isPending && !isError) && (
          <div className="w-full md:col-span-2 lg:col-span-3 flex flex-col justify-center items-center gap-5">
            <Image alt="No addresses available" src="/empty-kraft-truck.webp" width={1021} height={597} className="object-cover w-56 h-56" />
            <h2 className="text-2xl font-bold text-center tracking-tight">No hay direcciones disponibles</h2>
            <p>Crea una nueva dirección para comenzar.</p>
            <Button onClick={toggleModalCreateAddress}>Crear dirección</Button>
          </div>
        )}
      </section>
      { openCreateAddress && (
        <CreateAddress
          open={openCreateAddress}
          toggleModal={toggleModalCreateAddress}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
          refetchAddresses={refetchAddresses}
        />
      )}
      { openDeleteAddress && (
        <DeleteAddressModal
          open={openDeleteAddress}
          addressAlias={selectedAddressAlias}
          toggleModal={toggleModalDeleteAddress}
          refetchAddresses={refetchAddresses}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )}
    </main>
  )
}