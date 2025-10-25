import { Modal, ModalHeader } from "flowbite-react"

import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { CreateGuideAddressFormGE } from "./CreateGuideAddressFormGE";

interface CreateGuideGEProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideGE = ({ open, toggleModal }: CreateGuideGEProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const closeModal = () => {
    // resetFormData()
    resetSteps()
    // resetSelectedQuotes()
    toggleModal()
  }

  return (
    <Modal show={open} onClose={closeModal}>
      <ModalHeader>Crear guía GE</ModalHeader>
      { !isMobileTablet && (
        <div className="py-6">
          <Stepper steps={steps} currentStep={step} />
        </div>
      )}
      { step === 1 && (
        <CreateGuideAddressFormGE
          typeAddress="origin"
          // addressData={formData.current.originAddress}
          // goNext={goNext}
          // updateOriginAddress={updateOriginAddress}
          // toggleModal={toggleModal}
          // goPrev={goPrev}
        />
      )}
      { step === 2 && (
        <CreateGuideAddressFormGE
          typeAddress="destination"
          // addressData={formData.current.originAddress}
          // goNext={goNext}
          // updateOriginAddress={updateOriginAddress}
          // toggleModal={toggleModal}
          // goPrev={goPrev}
        />
      )}
    </Modal>
  )
}