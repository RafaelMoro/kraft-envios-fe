"use client"
import { useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react"
import { useMutation } from "@tanstack/react-query";

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressForm } from "./CreateGuideAddressForm";
import { CreateGuideFormValues, CreateGuideAddressFormValues, ParcelInfoFormValues, SearchProduct, CreateGuideMnPayload, MnGuide } from "@/shared/types/guides.types";
import { initialStateForm } from "@/shared/constants/guides.constants";
import { ParcelInfoForm } from "./ParcelInfoForm";
import { ConfirmGuideData } from "./ConfirmGuideData";
import { ProductSatDropdown } from "./ProductSatDropdown";
import { QuoteUI } from "@/shared/types/quotes.types";
import { GeneralApiError } from "@/shared/types/global.types";
import { createGuideMnCb } from "@/shared/utils/guides.utils";
import { ResultGuideScreen } from "./ResultGuideScreen";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface CreateGuideProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal, selectedQuotes }: CreateGuideProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Domicilio origen", "Domicilio destino", "Información del paquete", "Confirmar datos"])

  // Reference to save the selected product
  const selectedProduct = useRef<SearchProduct | null>(null)
  const updateSelectedProduct = (option: SearchProduct) => {
    selectedProduct.current = option
  }

  // Search term state for product sat
  const [searchProductSat, setSearchProductSat] = useState<string>(selectedProduct.current?.description ?? '')
  const [errorProductSat, setErrorProductSat] = useState<string>('')

  // Form data to collect all steps data
  const formData = useRef<CreateGuideFormValues>({...initialStateForm})
  const resetFormData = () => {
    formData.current = {...initialStateForm}
    selectedProduct.current = null
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
    resetFormData()
    resetSteps()
    setSearchProductSat('')
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess } = useMutation<MnGuide, GeneralApiError, CreateGuideMnPayload>({
    mutationFn: createGuideMnCb,
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
          <CreateGuideAddressForm
            title="Domicilio origen"
            goNext={goNext}
            updateAddress={updateOriginAddress}
            addressData={formData.current.originAddress}
            isMobileTablet={isMobileTablet}
            toggleModal={closeModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <CreateGuideAddressForm
            title="Domicilio destino"
            goNext={goNext}
            updateAddress={updateDestinationAddress}
            addressData={formData.current.destinationAddress}
            isMobileTablet={isMobileTablet}
            isDestination
            toggleModal={toggleModal}
            goPrev={goPrev}
          />
        )}
        { step === 3 && (
          <ParcelInfoForm
            parcelInfo={formData.current.parcelInfo}
            searchProductSat={searchProductSat}
            isMobileTablet={isMobileTablet}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
            updateErrorProductSat={setErrorProductSat}
          >
            <ProductSatDropdown
              searchProductSat={searchProductSat}
              errorProductSat={errorProductSat}
              setSearchProductSat={setSearchProductSat}
              updateSelectedOption={updateSelectedProduct}
              updateErrorProductSat={setErrorProductSat}
            />
          </ParcelInfoForm>
        )}
        { step === 4 && (
          <ConfirmGuideData
            formData={formData.current}
            goPrev={goPrev}
            selectedProduct={selectedProduct.current}
            selectedQuotes={selectedQuotes}
            isPending={isPending}
            createGuide={createGuide}
          />
        )}
        { (isError || isSuccess) && step === 5 && (
          <ResultGuideScreen guide={data} isSuccess={isSuccess} isError={isError} closeModal={closeModal} />
        ) }
      </ModalBody>
    </Modal>
  )
}