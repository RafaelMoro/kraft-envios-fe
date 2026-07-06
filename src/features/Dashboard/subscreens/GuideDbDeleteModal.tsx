"use client"
import { useEffect, useState } from "react"
import { Button, Checkbox, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react"

import {
  GUIDES_DB_DELETE_MODAL_BODY,
  GUIDES_DB_DELETE_MODAL_CANCEL,
  GUIDES_DB_DELETE_MODAL_CONFIRM,
  GUIDES_DB_DELETE_MODAL_TITLE,
  GUIDES_DB_HARD_DELETE_MODAL_BODY,
  GUIDES_DB_HARD_DELETE_MODAL_CONFIRM,
  GUIDES_DB_HARD_DELETE_MODAL_TITLE,
} from "@/shared/constants/guides.constants"

interface GuideDbDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (permanent: boolean) => void
  isAdmin?: boolean
}

export const GuideDbDeleteModal = ({ open, onClose, onConfirm, isAdmin }: GuideDbDeleteModalProps) => {
  const [permanent, setPermanent] = useState(false)

  useEffect(() => {
    if (!open) {
      setPermanent(false)
    }
  }, [open])

  const title = permanent ? GUIDES_DB_HARD_DELETE_MODAL_TITLE : GUIDES_DB_DELETE_MODAL_TITLE
  const body = permanent ? GUIDES_DB_HARD_DELETE_MODAL_BODY : GUIDES_DB_DELETE_MODAL_BODY
  const confirmLabel = permanent ? GUIDES_DB_HARD_DELETE_MODAL_CONFIRM : GUIDES_DB_DELETE_MODAL_CONFIRM

  return (
    <Modal show={open} onClose={onClose} size="sm">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-center text-red-600 dark:text-red-400">{body}</p>
        { isAdmin && (
          <div className="mt-4 flex items-center gap-2 justify-center">
            <Checkbox
              id="guide-db-hard-delete-toggle"
              data-testid="guide-db-hard-delete-checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
            />
            <label htmlFor="guide-db-hard-delete-toggle" className="cursor-pointer">
              <span className="font-bold">Eliminar esta guia permanentemente?</span>
            </label>
          </div>
        ) }
      </ModalBody>
      <ModalFooter>
        <div className="w-full flex justify-between">
          <Button
            color="red"
            data-testid="guide-db-delete-confirm"
            onClick={() => onConfirm(permanent)}
          >
            {confirmLabel}
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
}
