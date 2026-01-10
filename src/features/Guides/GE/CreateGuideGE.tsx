import { useRef, useState } from "react";
import { Modal, ModalHeader } from "flowbite-react"

import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useSteps } from "@/shared/hooks/useSteps";
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { CreateGuideAddressValuesGE, CreateGuideFormValuesGE, CreateGuideGEPayload, GlobalCreateGuideResponse, PackageDimensions, ParcelInfoValuesGE, SearchProduct } from "@/shared/types/guides.types";
import { CREATE_GUIDE_STEPS, initialStateCreateGuideGE } from "@/shared/constants/guides.constants";
import { ParcelInfoFormGE } from "./ParcelInfoFormGE";
import { ProductSatDropdown } from "../Mn/ProductSatDropdown";
import { ConfirmGuideGE } from "./ConfirmGuideGE";
import { QuoteUI } from "@/shared/types/quotes.types";
import { useMutation } from "@tanstack/react-query";
import { GeneralApiError } from "@/shared/types/global.types";
import { createGuideGECb } from "@/shared/utils/guides.utils";
import { ResultGuideScreen } from "../Mn/ResultGuideScreen";
import { AddAddressGE } from "./AddAddressGE";

interface CreateGuideGEProps {
  open: boolean;
  packageDimensions: PackageDimensions | null;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
  resetSelectedQuotes: () => void
}

export const CreateGuideGE = ({ open, toggleModal, resetSelectedQuotes, packageDimensions, selectedQuotes }: CreateGuideGEProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(CREATE_GUIDE_STEPS)

  const [errorSelectAlias, setErrorSelectAlias] = useState<string | null>(null)
  const [searchProductSat, setSearchProductSat] = useState<string>('')
  const [errorProductSat, setErrorProductSat] = useState<string>('')

  const selectedProduct = useRef<SearchProduct | null>(null)
  const updateSelectedProduct = (option: SearchProduct) => {
    selectedProduct.current = option
  }

  const formData = useRef<CreateGuideFormValuesGE>({...initialStateCreateGuideGE})
  const resetFormData = () => {
    formData.current = {...initialStateCreateGuideGE}
  }

  /**
   * This function updates the origin address in the form data.
   * It always returns true as the boolean that is returned indicates if there was an error, to catch same alias error.
   * @returns true
   */
  const updateOriginAddress = (data: CreateGuideAddressValuesGE) => {
    formData.current.originAddress = data
    return true
  }

  /**
   * This function updates the destination address in the form data.
   * If it's the same as the origin address, it sets an error and returns false.
   * If not, it updates the address and returns true.
   * @returns boolean
   */
  const updateDestinationAddress = (data: CreateGuideAddressValuesGE) => {
    if (data.alias === formData.current.originAddress.alias) {
      setErrorSelectAlias('El alias de la dirección de destino no puede ser igual al de origen')
      return false
    }

    // Reset error if exist
    if (errorSelectAlias) {
      setErrorSelectAlias(null)
    }

    formData.current.destinationAddress = data
    return true
  }

  const updateParcelInfo = (data: ParcelInfoValuesGE) => {
    if (packageDimensions) {
      const updatedData = { ...packageDimensions, content: data.content, satProductId: data.satProductId }
      formData.current.parcelInfo = updatedData
      return;
    }
    console.warn('No package dimensions available to update parcel info')
  }

  const closeModal = () => {
    resetFormData()
    resetSteps()
    setSearchProductSat('')
    setErrorSelectAlias(null)
    resetSelectedQuotes()
    toggleModal()
  }

  const { mutate: createGuide, data, isError, isPending, isSuccess } = useMutation<GlobalCreateGuideResponse, GeneralApiError, CreateGuideGEPayload>({
    mutationFn: createGuideGECb,
    onSuccess: () => {
      goNext()
    },
    onError: () => {
      goNext()
    }
  })

  return (
    <Modal show={open} onClose={closeModal}>
      <ModalHeader>Crear guía GE</ModalHeader>
      { !isMobileTablet && (
        <div className="py-6 flex justify-center">
          <Stepper steps={steps} currentStep={step} />
        </div>
      )}
      { step === 1 && (
        <AddAddressGE
          typeAddress="origin"
          addressData={formData.current.originAddress}
          aliasError={errorSelectAlias}
          setAliasError={setErrorSelectAlias}
          goNext={goNext}
          updateAddress={updateOriginAddress}
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )}
      { step === 2 && (
        <AddAddressGE
          typeAddress="destination"
          addressData={formData.current.destinationAddress}
          aliasError={errorSelectAlias}
          setAliasError={setErrorSelectAlias}
          goNext={goNext}
          updateAddress={updateDestinationAddress}
          toggleModal={toggleModal}
          goPrev={goPrev}
        />
      )}
      { step === 3 && (
        <ParcelInfoFormGE
          isMobileTablet={isMobileTablet}
          searchProductSat={searchProductSat}
          selectedProduct={selectedProduct.current}
          parcelInfo={formData.current.parcelInfo}
          goNext={goNext}
          goPrev={goPrev}
          updateErrorProductSat={setErrorProductSat}
          updateParcelInfo={updateParcelInfo}
        >
          <ProductSatDropdown
            searchProductSat={searchProductSat}
            errorProductSat={errorProductSat}
            setSearchProductSat={setSearchProductSat}
            updateSelectedOption={updateSelectedProduct}
            updateErrorProductSat={setErrorProductSat}
          />
        </ParcelInfoFormGE>
      )}
      { step === 4 && (
        <ConfirmGuideGE
          formData={formData.current}
          selectedProduct={selectedProduct.current}
          selectedQuotes={selectedQuotes}
          goPrev={goPrev}
          isPending={isPending}
          createGuide={createGuide}
        />
      )}
      { (isError || isSuccess) && step === 5 && (
        <ResultGuideScreen guide={data} isSuccess={isSuccess} isError={isError} closeModal={closeModal} />
      ) }
    </Modal>
  )
}