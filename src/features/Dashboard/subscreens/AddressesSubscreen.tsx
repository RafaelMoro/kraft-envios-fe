"use client"
import { useState } from "react"
import { Button } from "flowbite-react"

import { LoginData } from "@/shared/types/login.types"
import { CreateAddress } from "@/features/Addresses/CreateAddress"

interface AddressesSubscreenProps {
  userInfo: LoginData | null
}

export const AddressesSubscreen = ({ userInfo }: AddressesSubscreenProps) => {
  const [openCreateAddress, setOpenCreateAddress] = useState(false)
  const toggleModalCreateAddress = () => setOpenCreateAddress((prev) => !prev)

  return (
    <main className='w-full p-4 flex flex-col gap-4'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center">Aquí puedes gestionar las direcciones que uses posteriormente para crear guías.</p>
      <div className="w-full flex justify-end">
        <Button onClick={toggleModalCreateAddress}>Crear dirección</Button>
      </div>
      <CreateAddress open={openCreateAddress} toggleModal={toggleModalCreateAddress} />
    </main>
  )
}