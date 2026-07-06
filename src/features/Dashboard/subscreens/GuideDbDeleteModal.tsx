"use client"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react"

import {
  GUIDES_DB_DELETE_MODAL_BODY,
  GUIDES_DB_DELETE_MODAL_CANCEL,
  GUIDES_DB_DELETE_MODAL_CONFIRM,
  GUIDES_DB_DELETE_MODAL_TITLE,
} from "@/shared/constants/guides.constants"

interface GuideDbDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const GuideDbDeleteModal = ({ open, onClose, onConfirm }: GuideDbDeleteModalProps) => (
  <Modal show={open} onClose={onClose} size="sm">
    <ModalHeader>{GUIDES_DB_DELETE_MODAL_TITLE}</ModalHeader>
    <ModalBody>
      <p className="text-center text-red-600 dark:text-red-400">{GUIDES_DB_DELETE_MODAL_BODY}</p>
    </ModalBody>
    <ModalFooter>
      <div className="w-full flex justify-between">
        <Button
          color="red"
          data-testid="guide-db-delete-confirm"
          onClick={onConfirm}
        >
          {GUIDES_DB_DELETE_MODAL_CONFIRM}
        </Button>
        <Button
          color="gray"
          data-testid="guide-db-delete-cancel"
          onClick={onClose}
        >
          {GUIDES_DB_DELETE_MODAL_CANCEL}
        </Button>
      </div>
    </ModalFooter>
  </Modal>
)
