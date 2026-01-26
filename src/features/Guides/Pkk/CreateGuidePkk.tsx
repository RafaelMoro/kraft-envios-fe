import { useRef } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useMutation } from "@tanstack/react-query";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressValuesPkk, CreateGuideFormValuesPkk, CreateGuidePkkPayload, GlobalCreateGuideResponse, PackageDimensions, ParcelInfoValues } from "@/shared/types/guides.types";
import { CREATE_GUIDE_STEPS, initialStateFormPkk } from "@/shared/constants/guides.constants";
import { ParcelInfo } from "../ParcelInfo";
import { ConfirmGuidePkk } from "./ConfirmGuidePkk";
import { createGuidePkkCb } from "@/shared/utils/guides.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { ResultGuideScreen } from "../ResultGuideScreen";
import { useSaveAlias } from "@/shared/hooks/useAlias";
import { AddAddressPkk } from "./AddAddressPkk";

interface CreateGuidePkkProps {
  open: boolean;
  packageDimensions: PackageDimensions | null;
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuidePkk = ({
  open, packageDimensions, toggleModal, resetSelectedQuotes,
}: CreateGuidePkkProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(CREATE_GUIDE_STEPS)

  const { aliasesPkk, updateOriginAliasPkk, updateDestinationAliasPkk, resetAliases } = useSaveAlias()

  const formData = useRef<CreateGuideFormValuesPkk>({...initialStateFormPkk})
  console.log('formData', formData.current)
  const resetFormData = () => {
    formData.current = {...initialStateFormPkk}
  }
  const updateOriginAddress = (data: CreateGuideAddressValuesPkk) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressValuesPkk) => {
    formData.current.destinationAddress = data
  }
  const updateParcelInfo = (data: ParcelInfoValues) => {
    if (packageDimensions) {
      const updatedData = { ...packageDimensions, content: data.content }
      formData.current.parcelInfo = updatedData
      return;
    }
    console.warn('No package dimensions available to update parcel info')
  }

  const closeModal = () => {
    resetAliases()
    resetFormData()
    resetSteps()
    resetSelectedQuotes()
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess, error } = useMutation<GlobalCreateGuideResponse, GeneralApiError, CreateGuidePkkPayload>({
    mutationFn: createGuidePkkCb,
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
          <AddAddressPkk
            addressData={formData.current.originAddress}
            goNext={goNext}
            aliasSaved={aliasesPkk.origin}
            updateSavedAlias={updateOriginAliasPkk}
            updateAddress={updateOriginAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <AddAddressPkk
            addressData={formData.current.destinationAddress}
            goNext={goNext}
            aliasSaved={aliasesPkk.destination}
            updateSavedAlias={updateDestinationAliasPkk}
            updateAddress={updateDestinationAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
            isDestination
          />
        )}
        { step === 3 && (
          <ParcelInfo<ParcelInfoValues>
            parcelInfo={formData.current.parcelInfo}
            isMobileTablet={isMobileTablet}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
          />
        )}
        { step === 4 && (
          <ConfirmGuidePkk
            formData={formData.current}
            goPrev={goPrev}
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