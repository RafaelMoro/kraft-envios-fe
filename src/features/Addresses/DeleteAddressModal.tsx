import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";

interface DeleteAddressModalProps {
  open: boolean;
  toggleModal: () => void;
  addressAlias: string;
}

export const DeleteAddressModal = ({ open, toggleModal, addressAlias }: DeleteAddressModalProps) => {
  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Eliminar dirección</ModalHeader>
      <ModalBody>
        <p className="font-semibold text-center mb-2">¿Estás seguro que deseas eliminar la dirección &quot;{addressAlias}&quot;?</p>
        <p className="text-red-600 dark:text-red-400 text-center">Esta acción no se puede deshacer.</p>
      </ModalBody>
      <ModalFooter>
        <div className="w-full flex justify-between">
          <Button outline onClick={toggleModal}>Cancelar</Button>
          <Button color="red">Eliminar</Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}