import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "flowbite-react"

import { AddAddressCreateGuide } from "@/features/Addresses/AddAddressCreateGuide"
import { PersonalDataTone } from "./PersonalDataTone"
import { AddAddressToneFormSchema, CreateGuidePersonalDataToneFormValues, CreateGuideAddressFormValuesTone } from "@/shared/types/guides.types"
import { SelectAddressDropdown } from "@/features/Addresses/SelectAddressDropdown"
import { Address } from "@/shared/types/addresses.types"
import { AddTempAddressTone } from "./AddTempAddressTone"

interface AddAddressToneProps {
  addressData: CreateGuideAddressFormValuesTone
  isDestination?: boolean
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
}

export const AddAddressTone = ({
  addressData, updateAddress, isDestination, goNext, goPrev, toggleModal
}: AddAddressToneProps) => {
  const [useTempAddress, setUseTempAddress] = useState(false);
  const toggleTempAddress = () => setUseTempAddress((prev) => !prev);

  const [aliasSelected, setAliasSelected] = useState("");

  const cancelColorButton = isDestination ? "light" : "red"
  const cancelButtonText = isDestination ? "Regresar" : "Cancelar"
  const handleCancel = () => {
    if (isDestination) {
      goPrev()
      return
    }

    toggleModal()
  }

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<CreateGuidePersonalDataToneFormValues>({
    resolver: yupResolver(AddAddressToneFormSchema)
  })

  const onSubmit: SubmitHandler<CreateGuidePersonalDataToneFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    // updateAddress(data)
    console.log('data', data)
    // goNext()
  }

  const updateAddressInfo = (newAddress: Address) => {
    const updatedAddressData: CreateGuideAddressFormValuesTone = {
      street1: newAddress.addressName,
      external_number: newAddress.externalNumber,
      neighborhood: newAddress.neighborhood,
      town: newAddress?.town?.[0],
      state: newAddress.state,
      reference: newAddress.reference,
      // TODO: Update these fields when available
      name: '',
      lastName: '',
      phone: ''
    }
    updateAddress(updatedAddressData)
  }

  if (useTempAddress) {
    return (
      <AddTempAddressTone
        addressData={addressData}
        goNext={goNext}
        updateAddress={updateAddress}
        isDestination={isDestination}
        toggleModal={toggleModal}
        goPrev={toggleTempAddress}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <AddAddressCreateGuide
        PersonalDataUI={
          <PersonalDataTone<CreateGuidePersonalDataToneFormValues>
            addressData={addressData}
            errors={errors}
            register={register}
          />
        }
        SubmitFormUI={
          <div className="flex justify-between mt-8">
            <Button
              {...(!isDestination && { outline: true })}
              color={cancelColorButton}
              data-testid="origin-address-cancel-button"
              className="hover:cursor-pointer"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </Button>
            <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
              Siguiente
            </Button>
          </div>
        }
        CreateTempAddressButton={
          <div className="my-4 w-full flex justify-end">
            <Button outline onClick={toggleTempAddress}>Usar dirección temporal</Button>
          </div>
        }
      >
        <SelectAddressDropdown
          aliasSelected={aliasSelected}
          setAliasSelected={setAliasSelected}
          updateAddressInfo={updateAddressInfo}
        />
      </AddAddressCreateGuide>
    </form>
  )
}