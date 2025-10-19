import { useRef } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSteps } from "@/shared/hooks/useSteps";
import { QuoteUI } from "@/shared/types/quotes.types";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressFormPkk } from "./CreateGuideAddressFormPkk";
import { CreateGuideAddressValuesPkk, CreateGuideFormValuesPkk, ParcelInfoValues } from "@/shared/types/guides.types";
import { initialStateFormPkk } from "@/shared/constants/guides.constants";
import { ParcelInfo } from "../ParcelInfo";

interface CreateGuidePkkProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuidePkk = ({
  open, selectedQuotes, toggleModal, resetSelectedQuotes,
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
    const currentContentData = { ...formData.current.parcelInfo }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content: oldContent, ...rest   } = currentContentData
    const updatedData = { ...rest, content: data.content }
    formData.current.parcelInfo = updatedData
  }

  const closeModal = () => {
    resetFormData()
    resetSteps()
    resetSelectedQuotes()
    toggleModal()
  }

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
          <ParcelInfo
            parcelInfo={formData.current.parcelInfo}
            isMobileTablet={isMobileTablet}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
          />
        )}
      </ModalBody>
    </Modal>
  )
}