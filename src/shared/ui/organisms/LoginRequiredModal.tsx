"use client";

import { Modal, ModalBody, ModalFooter } from "flowbite-react";
import { useState } from "react";
import { LinkButton } from "../atoms/LinkButton";
import { LOGIN_ROUTE } from "@/shared/constants/global.constants";

interface LoginRequiredModalProps {
  accessToken: string
}

export const LoginRequiredModal = ({ accessToken }: LoginRequiredModalProps) => {
  const [openModal, setOpenModal] = useState<boolean>(!accessToken);
  const toggleModal = () => setOpenModal((prevState) => !prevState);

  return (
    <Modal show={openModal} onClose={toggleModal}>
        <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
          <h4 className="text-xl font-medium text-gray-900 dark:text-white">Vuelve a iniciar sesión para continuar</h4>
        </div>
        <ModalBody>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Por motivos de seguridad, tu sesión se cerró automáticamente. Ingresa de nuevo para continuar.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <LinkButton href={LOGIN_ROUTE}>Iniciar sesión</LinkButton>
        </ModalFooter>
      </Modal>
  )
}