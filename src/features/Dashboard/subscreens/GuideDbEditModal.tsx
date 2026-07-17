"use client"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react"

import { GUIDES_DB_EDIT_MODAL_TITLE } from "@/shared/constants/guides.constants"
import { GuideDbRecord } from "@/shared/types/guides.types"

type GuideDbEditModalProps = {
  open: boolean
  onClose: () => void
  guide: GuideDbRecord | null
}

export const GuideDbEditModal = ({ open, onClose }: GuideDbEditModalProps) => (
  <Modal show={open} onClose={onClose} size="lg" data-testid="guide-db-edit-modal">
    <ModalHeader>{GUIDES_DB_EDIT_MODAL_TITLE}</ModalHeader>
    <ModalBody>
      <p>Formulario de edición — próximamente</p>
    </ModalBody>
    <ModalFooter>
      <Button color="gray" onClick={onClose}>Cancelar</Button>
    </ModalFooter>
  </Modal>
)
