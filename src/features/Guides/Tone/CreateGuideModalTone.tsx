"use client"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { CreateGuideAddressFormTone } from "./CreateGuideAddressFormTone";
import { useRef } from "react";
import { CreateGuideAddressFormValuesTone, CreateGuideFormValuesTone } from "@/shared/types/guides.types";
import { initialStateFormTone } from "@/shared/constants/guides.constants";

interface CreateGuideModalToneProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
}

export const CreateGuideModalTone = ({ open, selectedQuotes, toggleModal }: CreateGuideModalToneProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const formData = useRef<CreateGuideFormValuesTone>({...initialStateFormTone})
  const resetFormData = () => {
    formData.current = {...initialStateFormTone}
  }
  const updateOriginAddress = (data: CreateGuideAddressFormValuesTone) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressFormValuesTone) => {
    formData.current.destinationAddress = data
  }

  // TODO: Change close Modal fn
  const closeModal = () => {
    resetFormData()
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
            addressData={formData.current.originAddress}
            goNext={goNext}
            updateAddress={updateOriginAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <CreateGuideAddressFormTone
            addressData={formData.current.destinationAddress}
            goNext={goNext}
            updateAddress={updateDestinationAddress}
            isDestination
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
      </ModalBody>
    </Modal>
  )
}