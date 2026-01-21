import { Button, CheckIcon, Spinner } from "flowbite-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import {
  AddressDataGEFormValues,
  CreateAddressGEPayload,
  CreateAddressGEResponse,
  PersonalDataGEFormValues,
  PersonalInformationGEFormSchema,
} from "@/shared/types/guides.types";
import { PersonalInfoAddressGESubform } from "../Guides/GE/PersonalInfoAddressGESubform";
import {
  combineGEFormValues,
  createAddressGECb,
} from "@/shared/utils/guides.utils";
import { GeneralApiError } from "@/shared/types/global.types";
import { saveAddressToLocalStorage } from "@/shared/utils/addresses.utils";

interface AddPersonalInfoGESubformProps {
  addressDataGE: AddressDataGEFormValues | null;
  goBack: () => void;
  goResult: () => void;
  setShowErrorCreateAddressGe: (show: boolean) => void;
  refetchAddressesGE: () => Promise<void>;
}

export const AddPersonalInfoGESubform = ({
  addressDataGE,
  goBack,
  goResult,
  setShowErrorCreateAddressGe,
  refetchAddressesGE,
}: AddPersonalInfoGESubformProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalDataGEFormValues>({
    resolver: yupResolver(PersonalInformationGEFormSchema),
  });
  console.log("addressDataGE", addressDataGE);

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

  const onSubmit: SubmitHandler<PersonalDataGEFormValues> = (data, event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!addressDataGE) {
      console.warn("No address data GE provided");
      return;
    }

    // Convert payload to GE
    const formattedPayload = combineGEFormValues(data, addressDataGE);
    // Fire mutation to create address in GE
    createAddressGE(formattedPayload, {
      onError: async (error, variables) => {
        await saveAddressToLocalStorage(variables);
      },
    });
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
      />
      <div className="lg:col-span-2 flex justify-between mt-4">
        <Button
          color="red"
          outline
          data-testid="cancel-button-create-address-ge"
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess}
          onClick={goBack}
        >
          Cancelar
        </Button>
        <Button
          data-testid="submit-button-create-address-ge"
          type="submit"
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess}
        >
          {isSuccess && <CheckIcon />}
          {isPending && <Spinner aria-label="loading create address ge" />}
          {!isSuccess && !isPending && "Crear dirección"}
        </Button>
      </div>
    </form>
  );
};
