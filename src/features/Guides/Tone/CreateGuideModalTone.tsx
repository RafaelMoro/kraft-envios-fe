"use client"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { CreateGuideAddressFormTone } from "./CreateGuideAddressFormTone";

interface CreateGuideModalToneProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
}

export const CreateGuideModalTone = ({ open, selectedQuotes, toggleModal }: CreateGuideModalToneProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  // TODO: Add form data reference
  // TODO: Change close Modal fn
  const closeModal = () => {
    // resetFormData()
    resetSteps()
    toggleModal()
  }

  // TODO: Add mutation

  return (
    <Modal show={open} onClose={closeModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        { !isMobileTablet && (
          <div className="py-6">
            <Stepper steps={steps} currentStep={step} />
          </div>
        )}
        { step === 1 && (
          <CreateGuideAddressFormTone
            goNext={goNext}
          />
        )}
        { step === 2 && (
          <CreateGuideAddressFormTone
            goNext={goNext}
            isDestination
          />
        )}
      </ModalBody>
    </Modal>
  )
}