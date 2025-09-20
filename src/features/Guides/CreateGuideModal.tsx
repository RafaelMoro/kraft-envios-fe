"use client"
import { Modal, ModalBody, ModalHeader } from "flowbite-react"

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressForm } from "./CreateGuideAddressForm";
import { useRef } from "react";
import { CreateGuideFormValues, CreateGuideAddressFormValues, ParcelInfoFormValues } from "@/shared/types/guides.types";
import { initialStateForm } from "@/shared/constants/guides.constants";
import { ParcelInfoForm } from "./ParcelInfoForm";
import { ConfirmGuideData } from "./ConfirmGuideData";

interface CreateGuideProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal }: CreateGuideProps) => {
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const formData = useRef<CreateGuideFormValues>(initialStateForm)
  const resetFormData = () => {
    formData.current = initialStateForm
  }
  const updateOriginAddress = (data: CreateGuideAddressFormValues) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressFormValues) => {
    formData.current.destinationAddress = data
  }
  const updateParcelInfo = (data: ParcelInfoFormValues) => {
    formData.current.parcelInfo = data
  }
  const closeModal = () => {
    toggleModal()
    resetSteps()
    resetFormData()
  }

  return (
    <Modal show={open} onClose={closeModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        <div className="py-6">
          <Stepper steps={steps} currentStep={step} />
        </div>
        { step === 1 && (
          <CreateGuideAddressForm
            goNext={goNext}
            updateAddress={updateOriginAddress}
            addressData={formData.current.originAddress}
            toggleModal={closeModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <CreateGuideAddressForm
            goNext={goNext}
            updateAddress={updateDestinationAddress}
            addressData={formData.current.destinationAddress}
            isDestination
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 3 && (
          <ParcelInfoForm
            parcelInfo={formData.current.parcelInfo}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
          />
        )}
        { step === 4 && (
          <ConfirmGuideData formData={formData.current} />
        )}
      </ModalBody>
    </Modal>
  )
}