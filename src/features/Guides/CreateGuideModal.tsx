import { Modal, ModalBody, ModalHeader } from "flowbite-react"

interface CreateGuideProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal }: CreateGuideProps) => {
  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        <div>Stepper</div>
      </ModalBody>
    </Modal>
  )
}