"use client"
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react"

interface CreateGuideDbFlowSelectorProps {
  open: boolean
  toggleModal: () => void
  onCreateDb: () => void
  onCreateLegacy: () => void
}

export const CreateGuideDbFlowSelector = ({
  open,
  toggleModal,
  onCreateDb,
  onCreateLegacy,
}: CreateGuideDbFlowSelectorProps) => {
  return (
    <Modal show={open} onClose={toggleModal} size="md">
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Selecciona cómo quieres crear la guía
          </p>
          <Button
            data-testid="guides-db-flow-db-button"
            className="hover:cursor-pointer"
            onClick={onCreateDb}
          >
            Crear guía en Kraft
          </Button>
          <Button
            data-testid="guides-db-flow-legacy-button"
            color="light"
            className="hover:cursor-pointer"
            onClick={onCreateLegacy}
          >
            Crear guía externa
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}
