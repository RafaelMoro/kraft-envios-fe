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
        <p>¿Estás seguro que deseas eliminar la dirección &quot;{addressAlias}&quot;? Esta acción no se puede deshacer.</p>
      </ModalBody>
      <ModalFooter>
        <div>
          <Button outline onClick={toggleModal}>Cancelar</Button>
          <Button color="red">Eliminar</Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}