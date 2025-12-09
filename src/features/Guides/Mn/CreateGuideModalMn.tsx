"use client"
import { useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react"
import { useMutation } from "@tanstack/react-query";

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { AddTempAddressMn } from "./AddTempAddressMn";
import {
  CreateGuideFormValues,
  CreateGuideAddressFormValuesMn,
  ParcelInfoFormValues,
  SearchProduct,
  CreateGuideMnPayload,
  GlobalCreateGuideResponse,
} from "@/shared/types/guides.types";
import { CREATE_GUIDE_STEPS, initialStateForm } from "@/shared/constants/guides.constants";
import { ParcelInfoForm } from "./ParcelInfoForm";
import { ConfirmGuideData } from "./ConfirmGuideData";
import { ProductSatDropdown } from "./ProductSatDropdown";
import { QuoteUI } from "@/shared/types/quotes.types";
import { GeneralApiError } from "@/shared/types/global.types";
import { createGuideMnCb } from "@/shared/utils/guides.utils";
import { ResultGuideScreen } from "./ResultGuideScreen";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { AddAddressMn } from "./AddAddressMn";
import { useSaveAlias } from "@/shared/hooks/useAlias";

interface CreateGuideProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuideModal = ({ open, toggleModal, selectedQuotes, resetSelectedQuotes }: CreateGuideProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(CREATE_GUIDE_STEPS)

  // Reference to save the selected product
  const selectedProduct = useRef<SearchProduct | null>(null)
  const updateSelectedProduct = (option: SearchProduct) => {
    selectedProduct.current = option
  }

  // Search term state for product sat
  const [searchProductSat, setSearchProductSat] = useState<string>(selectedProduct.current?.description ?? '')
  const [errorProductSat, setErrorProductSat] = useState<string>('')

  const { aliasesMn, updateOriginAliasMn, updateDestinationAliasMn, resetAliasesMn } = useSaveAlias()
  // Form data to collect all steps data
  const formData = useRef<CreateGuideFormValues>({...initialStateForm})
  const resetFormData = () => {
    formData.current = {...initialStateForm}
    selectedProduct.current = null
  }
  const updateOriginAddress = (data: CreateGuideAddressFormValuesMn) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressFormValuesMn) => {
    formData.current.destinationAddress = data
  }
  const updateParcelInfo = (data: ParcelInfoFormValues) => {
    formData.current.parcelInfo = data
  }

  const closeModal = () => {
    resetAliasesMn()
    resetFormData()
    resetSteps()
    setSearchProductSat('')
    resetSelectedQuotes()
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess } = useMutation<GlobalCreateGuideResponse, GeneralApiError, CreateGuideMnPayload>({
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
          <div className="py-6 flex justify-center">
            <Stepper steps={steps} currentStep={step} />
          </div>
        )}
        { step === 1 && (
          <AddAddressMn
            title="Domicilio origen"
            goNext={goNext}
            updateAddress={updateOriginAddress}
            aliasSaved={aliasesMn.origin}
            updateSavedAlias={updateOriginAliasMn}
            addressData={formData.current.originAddress}
            isMobileTablet={isMobileTablet}
            toggleModal={closeModal}
            goPrev={goPrev}
          />
        )}
        { step === 2 && (
          <AddTempAddressMn
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
            selectedProduct={selectedProduct.current}
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