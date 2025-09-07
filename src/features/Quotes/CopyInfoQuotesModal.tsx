import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react"

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
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant
              to ensure a common set of data rights in the European Union. It requires organizations to notify users as
              soon as possible of high-risk data breaches that could personally affect them.
            </p>
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