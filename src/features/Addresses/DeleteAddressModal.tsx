"use client"
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, CheckIcon, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";

import { Address, AddressAliasResponse, DeleteAddressPayload } from "@/shared/types/addresses.types";
import { GeneralApiError } from "@/shared/types/global.types";
import { deleteAddressCb, deleteGEAddressCb } from "@/shared/utils/addresses.utils";
import { getGEAddressesCb } from "@/shared/utils/guides.utils";
import { DeleteGEAdressResponse } from "@/shared/types/guides.types";

interface DeleteAddressModalProps {
  open: boolean;
  addressToDelete: Address | null;
  toggleModal: () => void;
  refetchAddresses: () => Promise<void>;
  toggleNotification: () => void;
  updateNotificationMessage: (message: string) => void;
}

export const DeleteAddressModal = ({ open, toggleModal, addressToDelete, refetchAddresses, toggleNotification, updateNotificationMessage }: DeleteAddressModalProps) => {
  const [isGEAddress, setIsGEAddress] = useState(false)
  
  useEffect(() => {
    if (addressToDelete && addressToDelete.isGEAddress && !isGEAddress) {
      setIsGEAddress(true)
    }
  }, [addressToDelete, isGEAddress])

  const {
    data: geAddresses,
    isPending: isPendingGeAddresses,
    isError: isErrorGeAddresses,
  } = useQuery({
    queryKey: ['GEAddresses'],
    queryFn: getGEAddressesCb,
    enabled: isGEAddress
  })

  const { mutate: deleteAddress, isError, isPending, isSuccess, isIdle } = useMutation<AddressAliasResponse, GeneralApiError, DeleteAddressPayload>({
    mutationFn: deleteAddressCb,
    onSuccess: () => {
      refetchAddresses()
      setTimeout(() => {
        toggleModal()
      }, 1000)
    },
    onError: () => {
      updateNotificationMessage('Ocurrió un error al eliminar la dirección. Por favor, intenta de nuevo.')
      toggleNotification()
      toggleModal()
    }
  })

  const {
    mutate: deleteGEAddress,
    isError: isErrorGeDeleteAddress,
    isPending: isPendingGeDeleteAddress,
    isSuccess: isSuccessGeDeleteAddress,
    isIdle: isIdleGeDeleteAddress
  } = useMutation<DeleteGEAdressResponse, GeneralApiError, string>({
    mutationFn: deleteGEAddressCb,
    onSuccess: () => {
      if (addressToDelete) {
        deleteAddress({ alias: addressToDelete.alias })
      }
    },
    onError: () => {
      updateNotificationMessage('Ocurrió un error al eliminar la dirección de GE. Por favor, intente más tarde.')
      toggleNotification()
      toggleModal()
    }
  })

  const handleDelete = () => {
    if (!addressToDelete) {
      console.warn('No address to delete')
      return
    }
    if (geAddresses && addressToDelete?.isGEAddress) {
      const geAddresstoDelete = geAddresses?.find(geAddress => geAddress.alias === addressToDelete.alias)
      const geAddressId = geAddresstoDelete?.id
      if (!geAddressId) {
        console.warn('No GE address ID found to delete')
        return
      }
      // If this address was also created in GE, delete it from there first
      deleteGEAddress(geAddressId)
    } else {
      deleteAddress({ alias: addressToDelete.alias })
    }
  }

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Eliminar dirección</ModalHeader>
      <ModalBody>
        <p className="font-semibold text-center mb-2">¿Estás seguro que deseas eliminar la dirección &quot;{addressToDelete?.alias}&quot;?</p>
        { addressToDelete && addressToDelete?.isGEAddress && (
          <p className="font-semibold text-red-600 dark:text-red-400 text-center mb-2">Esta dirección también será eliminada de GE</p>
        )}
        <p className="text-red-600 dark:text-red-400 text-center">Esta acción no se puede deshacer.</p>
      </ModalBody>
      <ModalFooter>
        <div className="w-full flex justify-between">
          <Button disabled={isPending || isSuccess} outline onClick={toggleModal}>Cancelar</Button>
          <Button disabled={isPending || isSuccess || isPendingGeAddresses || isPendingGeDeleteAddress} onClick={handleDelete} color="red">
            { (isIdle || isError || isIdleGeDeleteAddress) && 'Eliminar'}
            { (isPending || isPendingGeAddresses || isPendingGeDeleteAddress) && (<Spinner aria-label="loading delete address" />) }
            { isSuccess && (<CheckIcon />)}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}