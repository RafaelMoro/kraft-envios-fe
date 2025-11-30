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

interface AddressesSubscreenProps {
  userInfo: LoginData | null
}

export const AddressesSubscreen = ({ userInfo }: AddressesSubscreenProps) => {
  const [openCreateAddress, setOpenCreateAddress] = useState(false)
  const toggleModalCreateAddress = () => setOpenCreateAddress((prev) => !prev)

  const {
    notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()

  const { data: addressesData, isPending, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesCb
  })

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
      <CreateAddress
        open={openCreateAddress}
        toggleModal={toggleModalCreateAddress}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
      />
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        { (isPending && !addressesData) && Array.from({ length: 3 }).map((_, index) => (
          <AddressCardSkeleton key={index} />
        ))}
        { (addressesData && addressesData.length > 0 && !isPending) && addressesData.map((addr) => (
          <AddressCard key={addr.alias} address={addr} />
        )) }
      </section>
    </main>
  )
}