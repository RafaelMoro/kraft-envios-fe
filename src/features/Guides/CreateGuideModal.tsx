"use client"
import { Modal, ModalBody, ModalHeader } from "flowbite-react"

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { OriginAddressForm } from "./OriginAddressForm";

interface CreateGuideProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal }: CreateGuideProps) => {
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        <div className="py-6">
          <Stepper steps={steps} currentStep={step} />
        </div>
        { step === 1 && (
          <OriginAddressForm goNext={goNext} />
        )}
      </ModalBody>
    </Modal>
  )
}