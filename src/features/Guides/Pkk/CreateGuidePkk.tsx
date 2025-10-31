import { useRef } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useMutation } from "@tanstack/react-query";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressFormPkk } from "./CreateGuideAddressFormPkk";
import { CreateGuideAddressValuesPkk, CreateGuideFormValuesPkk, CreateGuidePkkPayload, GlobalCreateGuideResponse, PackageDimensions, ParcelInfoValues } from "@/shared/types/guides.types";
import { initialStateFormPkk } from "@/shared/constants/guides.constants";
import { ParcelInfo } from "../ParcelInfo";
import { ConfirmGuidePkk } from "./ConfirmGuidePkk";
import { createGuidePkkCb } from "@/shared/utils/guides.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { ResultGuideScreen } from "../Mn/ResultGuideScreen";

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
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  const formData = useRef<CreateGuideFormValuesPkk>({...initialStateFormPkk})
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
      const currentContentData = { ...formData.current.parcelInfo }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content: oldContent, ...rest   } = currentContentData
      const updatedData = { ...packageDimensions, content: data.content }
      formData.current.parcelInfo = updatedData
      return;
    }
    console.warn('No package dimensions available to update parcel info')
  }

  const closeModal = () => {
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
          <div className="py-6">
            <Stepper steps={steps} currentStep={step} />
          </div>
        )}
        { step === 1 && (
          <CreateGuideAddressFormPkk
            addressData={formData.current.originAddress}
            goNext={goNext}
            updateOriginAddress={updateOriginAddress}
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <CreateGuideAddressFormPkk
            addressData={formData.current.destinationAddress}
            goNext={goNext}
            updateOriginAddress={updateDestinationAddress}
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