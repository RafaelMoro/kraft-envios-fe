"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Button } from "flowbite-react"

import { LoginData } from "@/shared/types/login.types"
import { ManageAddressForm } from "@/features/Addresses/ManageAddressForm"
import { useNotification } from "@/shared/hooks/useNotification"
import { Notification } from "@/shared/ui/atoms/Notification"
import { AddressCard } from "@/features/Addresses/AddressCard"
import { AddressCardSkeleton } from "@/features/Addresses/AddressCardSkeleton"
import { DeleteAddressModal } from "@/features/Addresses/DeleteAddressModal"
import { Address, CreateAddressPayload } from "@/shared/types/addresses.types"
import { initialStateAddressForm } from "@/shared/constants/addresses.constants"
import { useGetAddress } from "@/shared/hooks/useGetAddress"
import { CreateAddressGEPayload } from "@/shared/types/guides.types"
import { getAddressesGELocalStorage } from "@/shared/utils/addresses.utils"
import { PendingAddressGE } from "@/features/Addresses/PendingAddressGE"

interface AddressesSubscreenProps {
  userInfo: LoginData | null
}

export const AddressesSubscreen = ({ userInfo }: AddressesSubscreenProps) => {
  // Create address states
  const [openManageAddress, setOpenManageAddress] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const toggleModalManageAddress = () => {
    if (isEdit) {
      setIsEdit(false)
      formData.current = {...initialStateAddressForm}
    }
    setOpenManageAddress((prev) => !prev)
  }

  // Delete address states
  const [selectedAddressAlias, setSelectedAddressAlias] = useState<string>("")
  const [openDeleteAddress, setOpenDeleteAddress] = useState(false)
  const toggleModalDeleteAddress = () => setOpenDeleteAddress((prev) => !prev)

  const formData = useRef<CreateAddressPayload>({...initialStateAddressForm})

  const handleEditAddress = (addressToEdit: Address) => {
    formData.current = {
      addressName: addressToEdit.addressName,
      alias: addressToEdit.alias,
      city: addressToEdit.city,
      externalNumber: addressToEdit.externalNumber,
      internalNumber: addressToEdit.internalNumber || "",
      neighborhood: addressToEdit.neighborhood,
      reference: addressToEdit.reference || "",
      state: addressToEdit.state,
      zipcode: addressToEdit.zipcode,
      town: addressToEdit.town,
    }
    setIsEdit(true)
    toggleModalManageAddress()
  }

  const {
    notificationMessage, openNotification, toggleNotification, updateNotificationMessage
  } = useNotification()

  const { data: addressesData, refetch, isPending, isError } = useGetAddress()

  const handleDeleteAddress = (addressAlias: string) => {
    setSelectedAddressAlias(addressAlias)
    toggleModalDeleteAddress()
  }

  const refetchAddresses = async () => {
    await refetch()
  }

  const mockedAddresses: CreateAddressGEPayload[] = [
    {
      name: "Rafael Moro",
      phone: "2213526425",
      email: "j.temix33@gmail.com",
      company: "Kraft Envios",
      rfc: "XAXX010101000",
      street: "Blvd Norte",
      number: "4222",
      neighborhood: "Las cuartillas",
      city: "Puebla",
      state: "Puebla",
      zipcode: "72050",
      reference: "Sin referencia",
      alias: "Ana Erika Martinez",
    },
    {
      name: "Rafael Moro",
      phone: "2213526425",
      email: "j.temix33@gmail.com",
      company: "Kraft Envios",
      rfc: "XAXX010101000",
      street: "Blvd Norte",
      number: "4222",
      neighborhood: "Las cuartillas",
      city: "Puebla",
      state: "Puebla",
      zipcode: "72050",
      reference: "Sin referencia",
      alias: "Jose Eduardo Avila",
    },
  ];
  const [pendingAddressesGE, setPendingAddressesGE] = useState<CreateAddressGEPayload[] | null>(mockedAddresses)

  useEffect(() => {
    getAddressesGELocalStorage().then((addresses) => {
      if (!addresses) return
      setPendingAddressesGE(addresses)
    })
  }, [])

  const handleAddressRemoved = (alias: string) => {
    setPendingAddressesGE((prev) => 
      prev ? prev.filter((addr) => addr.alias !== alias) : null
    )
  }

  return (
    <main className='w-full p-4'>
      { openNotification && (
        <Notification message={notificationMessage} toggleNotification={toggleNotification} />
      ) }
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">Aquí puedes gestionar las direcciones que uses posteriormente para crear guías.</p>
        <div className="w-full flex justify-end">
          <Button onClick={toggleModalManageAddress}>Crear dirección</Button>
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
            <AddressCard key={addr.alias} address={addr} handleDeleteAddress={handleDeleteAddress} handleEditAddress={handleEditAddress} />
          )) }
          { (addressesData && addressesData.length === 0 && !isPending && !isError) && (
            <div className="w-full md:col-span-2 lg:col-span-3 flex flex-col justify-center items-center gap-5">
              <Image alt="No addresses available" src="/empty-kraft-truck.webp" width={1021} height={597} className="object-cover w-56 h-56" />
              <h2 className="text-2xl font-bold text-center tracking-tight">No hay direcciones disponibles</h2>
              <p>Crea una nueva dirección para comenzar.</p>
              <Button onClick={toggleModalManageAddress}>Crear dirección</Button>
            </div>
          )}
        </section>
      </div>
      { pendingAddressesGE && pendingAddressesGE.length > 0 && (
        <section className="mt-20 flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-center">Direcciones pendientes por crear en GE</h2>
          <div className="grid grid-cols-1 justify-items-center lg:justify-items-start lg:grid-cols-2 gap-5">
            { pendingAddressesGE.map((addr) => (
              <PendingAddressGE key={addr.alias} address={addr} onAddressRemoved={handleAddressRemoved} />
            ))}
          </div>
        </section>
      )}
      { openManageAddress && (
        <ManageAddressForm
          open={openManageAddress}
          formData={formData.current}
          isEdit={isEdit}
          toggleModal={toggleModalManageAddress}
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