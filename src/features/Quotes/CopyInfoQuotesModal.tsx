import { Button, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from "flowbite-react"

interface CopyInfoQuotesModalProps {
  open: boolean;
  toggleModal: () => void;
}

export const CopyInfoQuotesModal = ({ open, toggleModal }: CopyInfoQuotesModalProps) => {
  return (
    <Modal show={open} onClose={toggleModal}>
        <ModalHeader>Copiar información via Whatsapp</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Ingrese el whatsapp para enviar la información de las cotizaciones seleccionadas.
            </p>
            <TextInput
              id="phoneNumber"
              placeholder="5512345678"
              type="number"
              inputMode="numeric"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="red" onClick={toggleModal} outline>
            Cancelar
          </Button>
          <Button onClick={toggleModal}>Enviar</Button>
        </ModalFooter>
      </Modal>
  )
}