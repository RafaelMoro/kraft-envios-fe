"use client"
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, CheckIcon, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import { RiCheckboxCircleFill } from "@remixicon/react";

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
}

export const DeleteAddressModal = ({ open, toggleModal, addressToDelete, refetchAddresses, }: DeleteAddressModalProps) => {
  const [isGEAddress, setIsGEAddress] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [modalTitle, setModalTitle] = useState('Eliminar dirección')
  const [modalResultText, setModalResultText] = useState('')
  
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
    },
    onError: () => {
      setShowResult(true)
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
      setShowResult(true)
    }
  })

  useEffect(() => {
    if ((isErrorGeDeleteAddress || isError) && !isErrorGeAddresses) {
      setModalTitle('Error al eliminar la dirección')
      setModalResultText('Ocurrió un error al eliminar la dirección. Por favor, intenta de nuevo más tarde.')
    }
  }, [isErrorGeDeleteAddress, isError, isErrorGeAddresses])

  useEffect(() => {
    if (isErrorGeAddresses) {
      setModalTitle('Error al obtener la dirección de GE')
      setModalResultText('Ocurrió un error al obtener la información de la dirección en GE. Por favor, intenta de nuevo más tarde.')
    }
  }, [isErrorGeAddresses])

  useEffect(() => {
    if (isSuccessGeDeleteAddress && isSuccess) {
      setModalTitle('Dirección eliminada')
    }
  }, [isSuccessGeDeleteAddress, isSuccess])

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
      <ModalHeader>{modalTitle}</ModalHeader>
      <ModalBody>
        { !showResult && (
          <>
            <p className="font-semibold text-center mb-2">¿Estás seguro que deseas eliminar la dirección &quot;{addressToDelete?.alias}&quot;?</p>
            { addressToDelete && addressToDelete?.isGEAddress && (
              <p className="font-semibold text-red-600 dark:text-red-400 text-center mb-2">Esta dirección también será eliminada de GE</p>
            )}
            <p className="text-red-600 dark:text-red-400 text-center">Esta acción no se puede deshacer.</p>
          </>
        )}
        { showResult && isSuccess && isSuccessGeDeleteAddress && (
          <ul className="flex flex-col gap-3 items-center">
            <li className="inline-flex gap-1">
              <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-600" />
              Dirección eliminada en el sistema
            </li>
            <li className="inline-flex gap-1">
              <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-600" />
              Dirección eliminada en GE
            </li>
          </ul>
        )}
        { showResult && (isErrorGeDeleteAddress || isError) && (
          <p className="text-gray-600 dark:text-gray-400 text-center">{modalResultText}</p>
        )}
      </ModalBody>
      <ModalFooter>
        { !showResult && (
          <div className="w-full flex justify-between">
            <Button disabled={isPending || isSuccess} outline onClick={toggleModal}>Cancelar</Button>
            <Button disabled={isPending || isSuccess || isPendingGeAddresses || isPendingGeDeleteAddress} onClick={handleDelete} color="red">
              { (isIdle || isError || isIdleGeDeleteAddress) && 'Eliminar'}
              { (isPending || isPendingGeAddresses || isPendingGeDeleteAddress) && (<Spinner aria-label="loading delete address" />) }
              { isSuccess && (<CheckIcon />)}
            </Button>
          </div>
        )}
        { showResult && (
          <div className="w-full flex justify-center">
            <Button onClick={toggleModal}>
              Listo
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  )
}