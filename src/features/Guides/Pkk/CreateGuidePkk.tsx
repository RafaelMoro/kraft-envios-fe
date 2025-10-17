import { Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressFormPkk } from "./CreateGuideAddressFormPkk";

interface CreateGuidePkkProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuidePkk = ({
  open, selectedQuotes, toggleModal, resetSelectedQuotes,
}: CreateGuidePkkProps) => {
  const { isMobileTablet } = useMediaQuery()
    const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
    const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const closeModal = () => {
    // resetFormData()
    resetSteps()
    resetSelectedQuotes()
    toggleModal()
  }

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
          <CreateGuideAddressFormPkk
            // addressData={formData.current.originAddress}
            goNext={goNext}
            // updateAddress={updateOriginAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
      </ModalBody>
    </Modal>
  )
}