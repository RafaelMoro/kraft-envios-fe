"use client"
import { AddressAliasResponse, DeleteAddressPayload } from "@/shared/types/addresses.types";
import { GeneralApiError } from "@/shared/types/global.types";
import { deleteAddressCb } from "@/shared/utils/addresses.utils";
import { useMutation } from "@tanstack/react-query";
import { Button, CheckIcon, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";

interface DeleteAddressModalProps {
  open: boolean;
  addressAlias: string;
  toggleModal: () => void;
  refetchAddresses: () => Promise<void>;
}

export const DeleteAddressModal = ({ open, toggleModal, addressAlias, refetchAddresses }: DeleteAddressModalProps) => {
  const { mutate: deleteAddress, isError, isPending, isSuccess, isIdle } = useMutation<AddressAliasResponse, GeneralApiError, DeleteAddressPayload>({
    mutationFn: deleteAddressCb,
    onSuccess: () => {
      refetchAddresses()
      setTimeout(() => {
        toggleModal()
      }, 1000)
    },
    onError: () => {
      // updateNotificationMessage('Ocurrió un error al crear la dirección. Por favor, intenta de nuevo.')
      // toggleNotification()
      // reset()
      // toggleModal()
    }
  })

  const handleDelete = () => {
    deleteAddress({ alias: addressAlias })
  }

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Eliminar dirección</ModalHeader>
      <ModalBody>
        <p className="font-semibold text-center mb-2">¿Estás seguro que deseas eliminar la dirección &quot;{addressAlias}&quot;?</p>
        <p className="text-red-600 dark:text-red-400 text-center">Esta acción no se puede deshacer.</p>
      </ModalBody>
      <ModalFooter>
        <div className="w-full flex justify-between">
          <Button disabled={isPending || isSuccess} outline onClick={toggleModal}>Cancelar</Button>
          <Button disabled={isPending || isSuccess} onClick={handleDelete} color="red">
            { (isIdle || isError) && 'Eliminar'}
            { isPending && (<Spinner aria-label="loading delete address" />) }
            { isSuccess && (<CheckIcon />)}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}