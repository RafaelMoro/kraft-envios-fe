import { Modal, ModalHeader } from "flowbite-react"

import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { CreateGuideAddressFormGE } from "./CreateGuideAddressFormGE";
import { useRef } from "react";
import { CreateGuideAddressValuesGE, CreateGuideFormValuesGE } from "@/shared/types/guides.types";
import { initialStateCreateGuideGE } from "@/shared/constants/guides.constants";

interface CreateGuideGEProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideGE = ({ open, toggleModal }: CreateGuideGEProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const formData = useRef<CreateGuideFormValuesGE>({...initialStateCreateGuideGE})
  const resetFormData = () => {
    formData.current = {...initialStateCreateGuideGE}
  }
  const updateOriginAddress = (data: CreateGuideAddressValuesGE) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressValuesGE) => {
    formData.current.destinationAddress = data
  }

  const closeModal = () => {
    resetFormData()
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
          goNext={goNext}
          updateAddress={updateOriginAddress}
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )}
      { step === 2 && (
        <CreateGuideAddressFormGE
          typeAddress="destination"
          // addressData={formData.current.originAddress}
          goNext={goNext}
          updateAddress={updateDestinationAddress}
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )}
    </Modal>
  )
}