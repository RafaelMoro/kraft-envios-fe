"use client"
import { useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader, } from "flowbite-react"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { AddressAliasResponse, CreateAddressFormSchema, CreateAddressFormValues, CreateAddressPayload, CreateAddressResponse, ManageAddressFormScreen } from "@/shared/types/addresses.types";
import { createAddressCb, editAddressCb } from "@/shared/utils/addresses.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { CreateAddressSubform } from "./CreateAddressSubform";
import { AddPersonalInfoGESubform } from "./AddPersonalInfoGESubform";
import { AddressDataGEFormValues } from "@/shared/types/guides.types";

interface CreateAddressProps {
  open: boolean;
  formData: CreateAddressPayload;
  isEdit: boolean;
  toggleModal: () => void;
  toggleNotification: () => void;
  updateNotificationMessage: (message: string) => void;
  refetchAddresses: () => Promise<void>;
}

export const ManageAddressForm = ({
  open, formData, isEdit, toggleModal, toggleNotification, updateNotificationMessage, refetchAddresses
}: CreateAddressProps) => {
  const [subscreen, setSubscreen] = useState<ManageAddressFormScreen>('CREATE_ADDRESS')
  const goBack = () => setSubscreen('CREATE_ADDRESS')
  const addressDataGE = useRef<AddressDataGEFormValues | null>(null)

  const updateAddressDataGE = (data: AddressDataGEFormValues) => {
    addressDataGE.current = data
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<CreateAddressFormValues>({
    resolver: yupResolver(CreateAddressFormSchema)
  })
  const actionText = isEdit ? 'Editar' : 'Crear'

  const onSuccess = async () => {
    await refetchAddresses()
    setTimeout(() => {
      reset()
      toggleModal()
    }, 1000)
  }

  const onError = () => {
    updateNotificationMessage(`Ocurrió un error al ${actionText} la dirección. Por favor, intenta de nuevo.`)
    toggleNotification()
    reset()
    toggleModal()
  }

  const {
    mutate: createAddressMutation, isPending, isSuccess
  } = useMutation<CreateAddressResponse, GeneralApiError, CreateAddressPayload>({
    mutationFn: createAddressCb,
    onSuccess: async () => {
      await onSuccess()
    },
    onError: () => {
      onError()
    }
  })

  const {
    mutate: editAddressMutation, isPending: isPendingEdit, isSuccess: isSuccessEdit,
  } = useMutation<AddressAliasResponse, GeneralApiError, CreateAddressPayload>({
    mutationFn: editAddressCb,
    onSuccess: async () => {
      await onSuccess()
    },
    onError: () => {
      onError()
    }
  })

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>{actionText} dirección</ModalHeader>
      <ModalBody>
        { subscreen === 'CREATE_ADDRESS' && (
          <CreateAddressSubform
            formData={formData}
            isEdit={isEdit}
            actionText={actionText}
            errors={errors}
            createAddressMutation={createAddressMutation}
            editAddressMutation={editAddressMutation}
            register={register}
            handleSubmit={handleSubmit}
            setError={setError}
            isPending={isPending}
            isSuccess={isSuccess}
            isPendingEdit={isPendingEdit}
            isSuccessEdit={isSuccessEdit}
            toggleModal={toggleModal}
            setSubscreen={setSubscreen}
            updateAddressDataGE={updateAddressDataGE}
          />
        )}
        { subscreen === 'ADD_GE_INFORMATION' && (
          <AddPersonalInfoGESubform
            addressDataGE={addressDataGE.current}
            goBack={goBack}
            createAddressMutation={createAddressMutation}
            />
        )}
      </ModalBody>
    </Modal>
  )
}