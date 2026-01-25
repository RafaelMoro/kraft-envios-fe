"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  AddressAliasResponse,
  CreateAddressFormSchema,
  CreateAddressFormValues,
  CreateAddressPayload,
  CreateAddressResponse,
  ManageAddressFormScreen,
} from "@/shared/types/addresses.types";
import { createAddressCb, editAddressCb } from "@/shared/utils/addresses.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { CreateAddressSubform } from "./CreateAddressSubform";
import { AddPersonalInfoGESubform } from "./AddPersonalInfoGESubform";
import { AddressDataGEFormValues } from "@/shared/types/guides.types";
import { ResultCreateAddress } from "./ResultCreateAddress";
import { getGEAddressesCb } from "@/shared/utils/guides.utils";

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
  open,
  formData,
  isEdit,
  toggleModal,
  toggleNotification,
  updateNotificationMessage,
  refetchAddresses,
}: CreateAddressProps) => {
  const [showErrorCreateAddressGe, setShowErrorCreateAddressGe] =
    useState(false);
  const [subscreen, setSubscreen] = useState<ManageAddressFormScreen>("CREATE_ADDRESS");
  const goBack = () => setSubscreen("CREATE_ADDRESS");
  const goResult = () => setSubscreen("SHOW_RESULT");

  // GE Address data
  const addressDataGE = useRef<AddressDataGEFormValues | null>(null);
  console.log('addressDataGE', addressDataGE.current)
  const updateAddressDataGE = (data: AddressDataGEFormValues) => {
    addressDataGE.current = data;
  };
  const resetAddressGE = () => {
    addressDataGE.current = null;
  }

  // Sync formData isGEAddress changes to addressDataGE
  useEffect(() => {
    if (formData.isGEAddress) {
      addressDataGE.current = {
        street1: formData.addressName,
        external_number: formData.externalNumber,
        neighborhood: formData.neighborhood,
        city: formData.city?.[0] ?? '',
        state: formData.state,
        alias: formData.alias,
        zipcode: formData.zipcode,
      }
    } else {
      addressDataGE.current = null;
    }
  }, [formData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
  } = useForm<CreateAddressFormValues>({
    resolver: yupResolver(CreateAddressFormSchema),
  });
  const setZipcodeError = (error: string) => {
    setError("zipcode", { type: "manual", message: error });
  };
  const clearManualAddressRegionFields = () => {
    setValue("zipcode", "");
    setValue("neighborhood", "");
    setValue("state", "");
  };
  const actionText = isEdit ? "Editar" : "Crear";

  const onSuccess = async () => {
    await refetchAddresses();
    reset();
    // Do not close modal if GE address data is present meaning that the creation of address in GE is pending
    if (addressDataGE.current) {
      return;
    }

    setTimeout(() => {
      toggleModal();
    }, 1000);
  };

  const onError = () => {
    updateNotificationMessage(
      `Ocurrió un error al ${actionText} la dirección. Por favor, intenta de nuevo.`,
    );
    toggleNotification();
    reset();
    toggleModal();
  };

  // This flag is to enable the fetching of alias in GE
  const [hasConsentedOnce, setHasConsentedOnce] = useState(false);
  const {
    data: addressesGE,
    refetch,
    isPending: isPendingFetchGeAddress,
    error: errorFetchGeAddress,
  } = useQuery({
    queryKey: ["GEAddresses"],
    queryFn: getGEAddressesCb,
    enabled: hasConsentedOnce || (formData?.isGEAddress && isEdit),
  });
  const dataAliases = useMemo(() => addressesGE?.map((addr) => addr.alias), [addressesGE]);
  const addressToEditGE = useMemo(() => addressesGE?.find((addr) => addr.alias === formData.alias) ?? null, [addressesGE, formData]);

  const refetchAddressesGE = async () => {
    await refetch();
  };

  const {
    mutate: createAddressMutation,
    isPending,
    isSuccess,
  } = useMutation<CreateAddressResponse, GeneralApiError, CreateAddressPayload>(
    {
      mutationFn: createAddressCb,
      onSuccess: async () => {
        await onSuccess();
      },
      onError: () => {
        onError();
      },
    },
  );

  const {
    mutate: editAddressMutation,
    isPending: isPendingEdit,
    isSuccess: isSuccessEdit,
  } = useMutation<AddressAliasResponse, GeneralApiError, CreateAddressPayload>({
    mutationFn: editAddressCb,
    onSuccess: async () => {
      await onSuccess();
    },
    onError: () => {
      onError();
    },
  });
  console.log('subscreen', subscreen)

  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>{actionText} dirección</ModalHeader>
      <ModalBody>
        {subscreen === "CREATE_ADDRESS" && (
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
            clearErrors={clearErrors}
            setValue={setValue}
            setZipcodeError={setZipcodeError}
            isPending={isPending}
            isSuccess={isSuccess}
            isPendingEdit={isPendingEdit}
            isSuccessEdit={isSuccessEdit}
            toggleModal={toggleModal}
            setSubscreen={setSubscreen}
            updateAddressDataGE={updateAddressDataGE}
            hasConsentedOnce={hasConsentedOnce}
            setHasConsentedOnce={setHasConsentedOnce}
            dataAliases={dataAliases}
            isPendingFetchAlias={isPendingFetchGeAddress}
            errorAlias={errorFetchGeAddress}
            clearManualAddressRegionFields={clearManualAddressRegionFields}
            resetAddressGE={resetAddressGE}
          />
        )}
        {subscreen === "ADD_GE_INFORMATION" && (
          <AddPersonalInfoGESubform
            addressDataGE={addressDataGE.current}
            isEdit={isEdit}
            addressToEditGE={addressToEditGE}
            goBack={goBack}
            goResult={goResult}
            setShowErrorCreateAddressGe={setShowErrorCreateAddressGe}
            refetchAddressesGE={refetchAddressesGE}
          />
        )}
        {subscreen === "SHOW_RESULT" && (
          <ResultCreateAddress
            toggleModal={toggleModal}
            isEdit={isEdit}
            showErrorCreateAddressGe={showErrorCreateAddressGe}
          />
        )}
      </ModalBody>
    </Modal>
  );
};
