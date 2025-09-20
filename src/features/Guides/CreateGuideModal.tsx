"use client"
import { Modal, ModalBody, ModalHeader } from "flowbite-react"

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { OriginAddressForm } from "./OriginAddressForm";
import { useRef } from "react";
import { CreateGuideFormValues, OriginAddressFormValues } from "@/shared/types/guides.types";

interface CreateGuideProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal }: CreateGuideProps) => {
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const formData = useRef<CreateGuideFormValues>({
    originAddress: {
      name: "",
      street1: "",
      neighborhood: "",
      external_number: "",
      city: "",
      company: "",
      state: "",
      phone: "",
      email: "",
      reference: ""
    }
  })
  const updateOriginAddress = (data: OriginAddressFormValues) => {
    formData.current.originAddress = data
  }

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        <div className="py-6">
          <Stepper steps={steps} currentStep={step} />
        </div>
        { step === 1 && (
          <OriginAddressForm goNext={goNext} updateOriginAddress={updateOriginAddress} originAddressData={formData.current.originAddress} />
        )}
      </ModalBody>
    </Modal>
  )
}