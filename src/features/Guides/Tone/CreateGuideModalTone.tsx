"use client"
import { useRef } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressFormTone } from "./CreateGuideAddressFormTone";
import { CreateGuideAddressFormValuesTone, CreateGuideFormValuesTone, CreateGuideTonePayload, GlobalCreateGuideResponse, ParcelInfoValuesTone } from "@/shared/types/guides.types";
import { initialStateFormTone } from "@/shared/constants/guides.constants";
import { ParcelInfoFormTone } from "./ParcelInfoFormTone";
import { ConfirmGuideDataTone } from "./ConfirmGuideDataTone";
import { useMutation } from "@tanstack/react-query";
import { GeneralApiError } from "@/shared/types/global.types";
import { createGuideToneCb } from "@/shared/utils/guides.utils";

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
  const updateParcelInfo = (data: ParcelInfoValuesTone) => {
    formData.current.parcelInfo = data
  }

  const closeModal = () => {
    resetFormData()
    resetSteps()
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess } = useMutation<GlobalCreateGuideResponse, GeneralApiError, CreateGuideTonePayload>({
    mutationFn: createGuideToneCb,
    onSuccess: () => {
      goNext()
    },
    onError: () => {
      goNext()
    }
  })

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
        { step === 3 && (
          <ParcelInfoFormTone
            parcelInfo={formData.current.parcelInfo}
            isMobileTablet={isMobileTablet}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
          />
        )}
        { step === 4 && (
          <ConfirmGuideDataTone
            formData={formData.current}
            goPrev={goPrev}
            selectedQuotes={selectedQuotes}
            isPending={false}
          />
        )}
      </ModalBody>
    </Modal>
  )
}