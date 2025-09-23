"use client"
import { Modal, ModalBody, ModalHeader } from "flowbite-react"
import { useRef, useState } from "react";

import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { CreateGuideAddressForm } from "./CreateGuideAddressForm";
import { CreateGuideFormValues, CreateGuideAddressFormValues, ParcelInfoFormValues, SearchProduct } from "@/shared/types/guides.types";
import { initialStateForm } from "@/shared/constants/guides.constants";
import { ParcelInfoForm } from "./ParcelInfoForm";
import { ConfirmGuideData } from "./ConfirmGuideData";
import { ProductSatDropdown } from "./ProductSatDropdown";

interface CreateGuideProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateGuideModal = ({ open, toggleModal }: CreateGuideProps) => {
  // TODO: Change this to step 1 after finishing product sat dropdown
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 3 })
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
    toggleModal()
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
            searchProductSat={searchProductSat}
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
          <ConfirmGuideData formData={formData.current} goPrev={goPrev} selectedProduct={selectedProduct.current} />
        )}
      </ModalBody>
    </Modal>
  )
}