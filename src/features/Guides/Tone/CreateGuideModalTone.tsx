"use client"
import { useRef } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import {
  CreateGuideAddressFormValuesTone,
  CreateGuideFormValuesTone,
  CreateGuideTonePayload,
  GlobalCreateGuideResponse,
  ParcelInfoValuesTone
} from "@/shared/types/guides.types";
import { CREATE_GUIDE_STEPS, initialStateFormTone } from "@/shared/constants/guides.constants";
import { ParcelInfo } from "../ParcelInfo";
import { ConfirmGuideDataTone } from "./ConfirmGuideDataTone";
import { useMutation } from "@tanstack/react-query";
import { GeneralApiError } from "@/shared/types/global.types";
import { createGuideToneCb } from "@/shared/utils/guides.utils";
import { ResultGuideScreen } from "../Mn/ResultGuideScreen";
import { AddAddressTone } from "./AddAddressTone";
import { useSaveAlias } from "@/shared/hooks/useAlias";

interface CreateGuideModalToneProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuideModalTone = ({ open, selectedQuotes, toggleModal, resetSelectedQuotes }: CreateGuideModalToneProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(CREATE_GUIDE_STEPS)

  const { aliases, updateOriginAlias, updateDestinationAlias, resetAliases } = useSaveAlias()
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
    resetSelectedQuotes()
    resetAliases()
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess, error } = useMutation<GlobalCreateGuideResponse, GeneralApiError, CreateGuideTonePayload>({
    mutationFn: createGuideToneCb,
    onSuccess: () => {
      goNext()
    },
    onError: () => {
      goNext()
    }
  })
  const errorMessage = error?.response?.data?.message

  return (
    <Modal show={open} onClose={closeModal}>
      <ModalHeader>Crear guía</ModalHeader>
      <ModalBody>
        { !isMobileTablet && (
          <div className="py-6 flex justify-center">
            <Stepper steps={steps} currentStep={step} />
          </div>
        )}
        { step === 1 && (
          <AddAddressTone
            addressData={formData.current.originAddress}
            aliasSaved={aliases.origin}
            updateSavedAlias={updateOriginAlias}
            goNext={goNext}
            updateAddress={updateOriginAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <AddAddressTone
            addressData={formData.current.destinationAddress}
            aliasSaved={aliases.destination}
            updateSavedAlias={updateDestinationAlias}
            goNext={goNext}
            updateAddress={updateDestinationAddress}
            isDestination
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 3 && (
          <ParcelInfo<ParcelInfoValuesTone>
            parcelInfo={formData.current.parcelInfo}
            isMobileTablet={isMobileTablet}
            isTone
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
            isPending={isPending}
            createGuide={createGuide}
          />
        )}
        { (isError || isSuccess) && step === 5 && (
          <ResultGuideScreen errorMessage={errorMessage} guide={data} isSuccess={isSuccess} isError={isError} closeModal={closeModal} />
        ) }
      </ModalBody>
    </Modal>
  )
}