"use client"
import { useRef, useState } from "react"
import { Alert, Modal, ModalBody, ModalHeader } from "flowbite-react"
import { useMutation } from "@tanstack/react-query"

import { useSteps } from "@/shared/hooks/useSteps"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { Stepper } from "@/shared/ui/atoms/Stepper"
import {
  CreateGuideAddressFormValuesMn,
  CreateGuideDbFormValues,
  CreateGuideDbPayload,
  CreateGuideDbResponse,
  PackageDimensions,
  SearchProduct,
} from "@/shared/types/guides.types"
import { CREATE_GUIDE_STEPS, initialStateFormGuideDb } from "@/shared/constants/guides.constants"
import { createGuideDbCb } from "@/shared/utils/guides.utils"
import { GeneralApiError } from "@/shared/types/global.types"
import { QuoteUI } from "@/shared/types/quotes.types"
import { useSaveAlias } from "@/shared/hooks/useAlias"

import { AddAddressGuideDb } from "./AddAddressGuideDb"
import { ParcelInfoGuideDbForm } from "./ParcelInfoGuideDbForm"
import { ConfirmGuideDbData } from "./ConfirmGuideDbData"
import { ProductSatDropdown } from "@/features/Guides/Mn/ProductSatDropdown"
import { ResultGuideDbScreen } from "./ResultGuideDbScreen"

interface CreateGuideDbModalProps {
  open: boolean
  selectedQuotes: QuoteUI[]
  packageDimensions: PackageDimensions | null
  toggleModal: () => void
  resetSelectedQuotes: () => void
}

export const CreateGuideDbModal = ({
  open,
  selectedQuotes,
  packageDimensions,
  toggleModal,
  resetSelectedQuotes,
}: CreateGuideDbModalProps) => {
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(CREATE_GUIDE_STEPS)

  const { aliasesMn, updateOriginAliasMn, updateDestinationAliasMn, resetAliases } = useSaveAlias()

  const selectedProduct = useRef<SearchProduct | null>(null)
  const updateSelectedProduct = (option: SearchProduct) => {
    selectedProduct.current = option
  }

  const [searchProductSat, setSearchProductSat] = useState<string>('')
  const [errorProductSat, setErrorProductSat] = useState<string>('')

  const formData = useRef<CreateGuideDbFormValues>({ ...initialStateFormGuideDb })
  const resetFormData = () => {
    formData.current = { ...initialStateFormGuideDb }
    selectedProduct.current = null
  }
  const updateOriginAddress = (data: CreateGuideAddressFormValuesMn) => {
    formData.current.originAddress = data
  }
  const updateDestinationAddress = (data: CreateGuideAddressFormValuesMn) => {
    formData.current.destinationAddress = data
  }
  const updateParcelInfo = (data: CreateGuideDbFormValues['parcelInfo']) => {
    formData.current.parcelInfo = data
  }

  const closeModal = () => {
    resetAliases()
    resetFormData()
    resetSteps()
    setSearchProductSat('')
    setErrorProductSat('')
    resetSelectedQuotes()
    toggleModal()
  }

  const {
    mutate: createGuide,
    data,
    isError,
    isPending,
    isSuccess,
    error,
  } = useMutation<CreateGuideDbResponse['data'], GeneralApiError, CreateGuideDbPayload>({
    mutationFn: createGuideDbCb,
    onSuccess: () => {
      goNext()
    },
    onError: () => {
      goNext()
    },
  })

  const selectedQuote = selectedQuotes[0]
  const blockingError =
    !selectedQuote
      ? 'Debes seleccionar una cotización para crear la guía.'
      : !packageDimensions
        ? 'No hay dimensiones del paquete disponibles. Vuelve a cotizar para crear la guía.'
        : null

  return (
    <Modal show={open} onClose={closeModal} size="3xl">
      <ModalHeader>Crear guía en Kraft</ModalHeader>
      <ModalBody>
        {blockingError ? (
          <Alert color="failure" data-testid="guides-db-blocking-error">
            <span>{blockingError}</span>
          </Alert>
        ) : (
          <>
            {!isMobileTablet && (
              <div className="py-6 flex justify-center">
                <Stepper steps={steps} currentStep={step} />
              </div>
            )}
            {step === 1 && (
              <AddAddressGuideDb
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
            {step === 2 && (
              <AddAddressGuideDb
                title="Domicilio destino"
                goNext={goNext}
                updateAddress={updateDestinationAddress}
                aliasSaved={aliasesMn.destination}
                updateSavedAlias={updateDestinationAliasMn}
                addressData={formData.current.destinationAddress}
                isMobileTablet={isMobileTablet}
                isDestination
                excludedAlias={aliasesMn.origin.alias}
                toggleModal={toggleModal}
                goPrev={goPrev}
              />
            )}
            {step === 3 && (
              <ParcelInfoGuideDbForm
                parcelInfo={formData.current.parcelInfo}
                packageDimensions={packageDimensions}
                isMobileTablet={isMobileTablet}
                searchProductSat={searchProductSat}
                selectedProduct={selectedProduct.current}
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
              </ParcelInfoGuideDbForm>
            )}
            {step === 4 && selectedQuote && (
              <ConfirmGuideDbData
                originAddress={formData.current.originAddress}
                destinationAddress={formData.current.destinationAddress}
                originAlias={aliasesMn.origin.alias}
                originTown={aliasesMn.origin.town}
                originZipcode={aliasesMn.origin.address?.zipcode ?? ''}
                destinationAlias={aliasesMn.destination.alias}
                destinationTown={aliasesMn.destination.town}
                destinationZipcode={aliasesMn.destination.address?.zipcode ?? ''}
                parcelInfo={formData.current.parcelInfo}
                selectedQuote={selectedQuote}
                packageDimensions={packageDimensions}
                selectedProduct={selectedProduct.current}
                isPending={isPending}
                goPrev={goPrev}
                onSubmit={createGuide}
              />
            )}
            {step === 5 && (
              <ResultGuideDbScreen
                result={data}
                isSuccess={isSuccess}
                isError={isError}
                errorMessage={error?.response?.data?.message}
                closeModal={closeModal}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  )
}
