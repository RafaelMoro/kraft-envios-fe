import { Modal, ModalHeader } from "flowbite-react"

import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { CreateGuideAddressFormGE } from "./CreateGuideAddressFormGE";

interface CreateGuideGEProps {
  open: boolean;
  closeModal: () => void;
}

export const CreateGuideGE = ({ open, closeModal }: CreateGuideGEProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

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