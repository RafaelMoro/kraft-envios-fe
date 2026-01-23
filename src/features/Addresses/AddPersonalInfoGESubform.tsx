import { Button, CheckIcon, Spinner } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import {
  AddressDataGEFormValues,
  AddressGE,
  CreateAddressGEPayload,
  CreateAddressGEResponse,
  PersonalDataGEFormValues,
  PersonalInformationGEFormSchema,
} from "@/shared/types/guides.types";
import { PersonalInfoAddressGESubform } from "../Guides/GE/PersonalInfoAddressGESubform";
import {
  combineGEFormValues,
  createAddressGECb,
  editAddressGECb,
} from "@/shared/utils/guides.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { saveAddressToLocalStorage } from "@/shared/utils/addresses.utils";

interface AddPersonalInfoGESubformProps {
  addressDataGE: AddressDataGEFormValues | null;
  isEdit: boolean;
  addressToEditGE: AddressGE | null
  goBack: () => void;
  goResult: () => void;
  setShowErrorCreateAddressGe: (show: boolean) => void;
  refetchAddressesGE: () => Promise<void>;
}

export const AddPersonalInfoGESubform = ({
  addressDataGE,
  isEdit,
  addressToEditGE,
  goBack,
  goResult,
  setShowErrorCreateAddressGe,
  refetchAddressesGE,
}: AddPersonalInfoGESubformProps) => {
  const action = isEdit ? "Editar" : "Crear";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalDataGEFormValues>({
    resolver: yupResolver(PersonalInformationGEFormSchema),
  });

  const {
    mutate: createAddressGE,
    isPending,
    isSuccess,
  } = useMutation<
    CreateAddressGEResponse,
    GeneralApiError,
    CreateAddressGEPayload
  >({
    mutationFn: createAddressGECb,
    onSuccess: async () => {
      reset();
      await refetchAddressesGE();
      setTimeout(() => {
        goResult();
      }, 1000);
    },
    onError: () => {
      setShowErrorCreateAddressGe(true);
      goResult();
    },
  });

  const {
    mutate: editAddressGE,
    isPending: isPendingEditGE,
    isSuccess: isSuccessEditGE,
  } = useMutation<
    CreateAddressGEResponse,
    GeneralApiError,
    { payload: CreateAddressGEPayload; addressId: string; currentAlias: string }
  >({
    mutationFn: editAddressGECb,
    onSuccess: async () => {
      reset();
      await refetchAddressesGE();
      setTimeout(() => {
        goResult();
      }, 1000);
    },
    onError: () => {
      setShowErrorCreateAddressGe(true);
      goResult();
    },
  });

  const onSubmit: SubmitHandler<PersonalDataGEFormValues> = (data, event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!addressDataGE) {
      console.warn("No address data GE provided");
      return;
    }

    // Convert payload to GE
    const formattedPayload = combineGEFormValues(data, addressDataGE);
    
    if (isEdit) {
      // Fire mutation to edit address in GE
      if (!addressToEditGE) {
        console.warn("Address ID and current alias are required for editing");
        return;
      }
      editAddressGE({ payload: formattedPayload, addressId: addressToEditGE.id, currentAlias: addressToEditGE.alias });
    } else {
      // Fire mutation to create address in GE
      createAddressGE(formattedPayload, {
        onError: async (error, variables) => {
          await saveAddressToLocalStorage(variables);
        },
      });
    }
  };

  return (
    <form
      className="p-4 overflow-y-auto flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-xl">Datos personales</h4>
      <PersonalInfoAddressGESubform<PersonalDataGEFormValues>
        errors={errors}
        register={register}
        addressToEditGE={addressToEditGE}
      />
      <div className="lg:col-span-2 flex justify-between mt-4">
        <Button
          color="red"
          outline
          data-testid="cancel-button-create-address-ge"
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess || isPendingEditGE || isSuccessEditGE}
          onClick={goBack}
        >
          Cancelar
        </Button>
        <Button
          data-testid="submit-button-create-address-ge"
          type="submit"
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess || isPendingEditGE || isSuccessEditGE}
        >
          {(isSuccess || isSuccessEditGE) && <CheckIcon />}
          {(isPending || isPendingEditGE) && <Spinner aria-label={`loading ${action} address ge`} />}
          {!isSuccess && !isPending && !isSuccessEditGE && !isPendingEditGE && `${action} dirección`}
        </Button>
      </div>
    </form>
  );
};
