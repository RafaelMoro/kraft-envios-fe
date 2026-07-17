"use client"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Modal, ModalBody, ModalHeader } from "flowbite-react"

import { AddAddressGuideDb } from "@/features/Guides-DB/AddAddressGuideDb"
import { ParcelInfoGuideDbForm } from "@/features/Guides-DB/ParcelInfoGuideDbForm"
import { ConfirmGuideDbEditData } from "@/features/Guides-DB/ConfirmGuideDbEditData"
import { ResultGuideDbScreen } from "@/features/Guides-DB/ResultGuideDbScreen"
import { ProductSatDropdown } from "@/features/Guides/Mn/ProductSatDropdown"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useSaveAlias } from "@/shared/hooks/useAlias"
import { useSteps } from "@/shared/hooks/useSteps"
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { CREATE_GUIDE_STEPS, GUIDES_DB_EDIT_MODAL_TITLE } from "@/shared/constants/guides.constants"
import { GeneralApiError } from "@/shared/types/global.types"
import {
  CreateGuideAddressFormValuesMn,
  CreateGuideDbFormValues,
  GuideDbRecord,
  PackageDimensions,
  SearchProduct,
  UpdateGuideDbPayload,
  UpdateGuideDbResponse,
} from "@/shared/types/guides.types"
import { buildUpdateGuideDbPayload, guideDbRecordToEditForm, updateGuideDbCb } from "@/shared/utils/guides.utils"

type GuideDbEditModalProps = {
  open: boolean
  onClose: () => void
  onUpdated?: () => void
  guide: GuideDbRecord | null
}

type UpdateGuideDbMutation = {
  kraftId: string
  payload: UpdateGuideDbPayload
}

export const GuideDbEditModal = ({ open, onClose, onUpdated, guide }: GuideDbEditModalProps) => {
  const queryClient = useQueryClient()
  const { isMobileTablet } = useMediaQuery()
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const { aliasesMn, updateOriginAliasMn, updateDestinationAliasMn, resetAliases } = useSaveAlias()
  const formData = useRef<CreateGuideDbFormValues | null>(null)
  const packageDimensions = useRef<PackageDimensions | null>(null)
  const selectedProduct = useRef<SearchProduct | null>(null)
  const stepperRef = useRef<HTMLDivElement>(null)
  const [searchProductSat, setSearchProductSat] = useState('')
  const [errorProductSat, setErrorProductSat] = useState('')
  const [noChangesDismissed, setNoChangesDismissed] = useState(false)

  useEffect(() => {
    if (!open || !guide) return
    const initial = guideDbRecordToEditForm(guide)
    formData.current = initial.formData
    packageDimensions.current = initial.packageDimensions
    selectedProduct.current = null
    setSearchProductSat(initial.searchProductSat)
    setErrorProductSat('')
    setNoChangesDismissed(false)
    resetSteps()
  // ponytail: local wizard state is enough until this flow needs persistence.
  }, [guide, open, resetSteps])

  useEffect(() => {
    if (step !== 2 || !stepperRef.current) return
    stepperRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const resetForm = () => {
    formData.current = null
    packageDimensions.current = null
    selectedProduct.current = null
    resetAliases()
    resetSteps()
    setSearchProductSat('')
    setErrorProductSat('')
    setNoChangesDismissed(false)
  }

  const closeModal = () => {
    resetForm()
    onClose()
  }

  const mutation = useMutation<UpdateGuideDbResponse['data'], GeneralApiError, UpdateGuideDbMutation>({
    mutationFn: ({ kraftId, payload }) => updateGuideDbCb(kraftId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides', 'db'] })
      onUpdated?.()
      goNext()
    },
    onError: goNext,
  })

  if (!guide || !formData.current) {
    return (
      <Modal show={open} onClose={closeModal} size="3xl" data-testid="guide-db-edit-modal">
        <ModalHeader>{GUIDES_DB_EDIT_MODAL_TITLE}</ModalHeader>
        <ModalBody><Alert color="info">Selecciona una guía para editar.</Alert></ModalBody>
      </Modal>
    )
  }

  const payload = buildUpdateGuideDbPayload(guide, formData.current, selectedProduct.current)
  const changedSections = Object.keys(payload) as (keyof UpdateGuideDbPayload)[]
  const isDeleted = guide.deletedAt != null

  const updateOriginAddress = (data: CreateGuideAddressFormValuesMn) => { formData.current!.originAddress = data }
  const updateDestinationAddress = (data: CreateGuideAddressFormValuesMn) => { formData.current!.destinationAddress = data }
  const updateParcelInfo = (data: CreateGuideDbFormValues['parcelInfo']) => { formData.current!.parcelInfo = data }
  const updateSelectedProduct = (option: SearchProduct) => { selectedProduct.current = option }
  const submitUpdate = () => {
    mutation.mutate({ kraftId: guide.kraftId, payload })
  }

  return (
    <Modal show={open} onClose={closeModal} size="3xl" data-testid="guide-db-edit-modal">
      <ModalHeader>{GUIDES_DB_EDIT_MODAL_TITLE}</ModalHeader>
      <ModalBody>
        {!isMobileTablet && (
          <div ref={stepperRef} className="py-6 flex justify-center">
            <Stepper steps={new Set(CREATE_GUIDE_STEPS)} currentStep={step} />
          </div>
        )}
        {step === 1 && (
          <AddAddressGuideDb
            title="Domicilio origen"
            goNext={goNext}
            goPrev={goPrev}
            toggleModal={closeModal}
            updateAddress={updateOriginAddress}
            aliasSaved={aliasesMn.origin}
            updateSavedAlias={updateOriginAliasMn}
            addressData={formData.current.originAddress}
            isMobileTablet={isMobileTablet}
            initialUseTempAddress
            editMode
          />
        )}
        {step === 2 && (
          <AddAddressGuideDb
            title="Domicilio destino"
            goNext={goNext}
            goPrev={goPrev}
            toggleModal={closeModal}
            updateAddress={updateDestinationAddress}
            aliasSaved={aliasesMn.destination}
            updateSavedAlias={updateDestinationAliasMn}
            addressData={formData.current.destinationAddress}
            isMobileTablet={isMobileTablet}
            isDestination
            excludedAlias={aliasesMn.origin.alias}
            initialUseTempAddress
            editMode
          />
        )}
        {step === 3 && (
          <ParcelInfoGuideDbForm
            parcelInfo={formData.current.parcelInfo}
            packageDimensions={packageDimensions.current}
            isMobileTablet={isMobileTablet}
            searchProductSat={searchProductSat}
            selectedProduct={selectedProduct.current}
            goNext={goNext}
            goPrev={goPrev}
            updateParcelInfo={updateParcelInfo}
            updateErrorProductSat={setErrorProductSat}
            editMode
            existingSatProductId={guide.parcel.satProductId}
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
        {step === 4 && (
          <ConfirmGuideDbEditData
            originAddress={formData.current.originAddress}
            destinationAddress={formData.current.destinationAddress}
            parcelInfo={formData.current.parcelInfo}
            satProductLabel={selectedProduct.current?.description ?? guide.parcel.satProductId}
            changedSections={changedSections}
            isDeleted={isDeleted}
            isPending={mutation.isPending}
            noChangesDismissed={noChangesDismissed}
            dismissNoChanges={() => setNoChangesDismissed(true)}
            goPrev={goPrev}
            onSubmit={submitUpdate}
          />
        )}
        {step === 5 && (
          <ResultGuideDbScreen
            mode="edit"
            result={mutation.data}
            isSuccess={mutation.isSuccess}
            isError={mutation.isError}
            errorMessage={mutation.error?.response?.data?.message}
            closeModal={closeModal}
          />
        )}
      </ModalBody>
    </Modal>
  )
}
