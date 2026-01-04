import { Button, CheckIcon, Spinner } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

import { AddressDataGEFormValues, CreateAddressGEPayload, CreateAddressGEResponse, PersonalDataGEFormValues, PersonalInformationGEFormSchema } from "@/shared/types/guides.types"
import { PersonalInfoAddressGESubform } from "../Guides/GE/PersonalInfoAddressGESubform"
import { CreateAddressPayload } from "@/shared/types/addresses.types"
import { combineGEFormValues, createAddressGECb } from "@/shared/utils/guides.utils"
import { GeneralApiError } from "@/shared/types/global.types"

interface AddPersonalInfoGESubformProps {
  addressDataGE: AddressDataGEFormValues | null;
  goBack: () => void;
  createAddressMutation: (payload: CreateAddressPayload) => void
}

export const AddPersonalInfoGESubform = ({ addressDataGE, goBack, createAddressMutation }: AddPersonalInfoGESubformProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataGEFormValues>({
    resolver: yupResolver(PersonalInformationGEFormSchema)
  })

  const { mutate: createAddressGE, isPending, isSuccess } = useMutation<CreateAddressGEResponse, GeneralApiError, CreateAddressGEPayload>({
    mutationFn: createAddressGECb,
    onSuccess: () => {
      // success
    },
    onError: () => {
      // error
    }
  })

  const onSubmit: SubmitHandler<PersonalDataGEFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!addressDataGE) {
      console.warn('No address data GE provided')
      return
    }

    // Convert payload to GE
    const formattedPayload = combineGEFormValues(data, addressDataGE)
    // Fire mutation to create address in GE
    createAddressGE(formattedPayload)
    // Fire mutation to create address in our API
  }

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
        { (isSuccess) && (<CheckIcon />)}
        { (isPending) && (<Spinner aria-label="loading create address ge" />) }
        { !isSuccess && !isPending && 'Crear dirección' }
      </Button>
    </div>
    </form>
  )
}