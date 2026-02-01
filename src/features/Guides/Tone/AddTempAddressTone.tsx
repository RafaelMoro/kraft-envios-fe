import { Button, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import { AddressType, CreateGuideAddressFormSchemaTone, CreateGuideAddressFormValuesTone } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { PersonalDataForm } from "../PersonalDataForm"
import { AutocompleteZipcode } from "@/features/Addresses/AutocompleteZipcode"
import { useAutocompleteZipcode } from "@/shared/hooks/useAutocompleteZipcode"
import { AddressRegionSelector } from "@/features/Addresses/AddressRegionSelector "
import { useAddressRegionSelector } from "@/shared/hooks/useAddressRegionSelector"
import { ManualFieldsTone } from "./ManualFieldsTone"

interface AddTempAddressToneProps {
  addressData: CreateGuideAddressFormValuesTone
  addressType: AddressType
  goNext: () => void
  toggleTempAddressModal: () => void
  updateAddress: (data: CreateGuideAddressFormValuesTone) => void
}

export const AddTempAddressTone = ({
  addressData, addressType, goNext, toggleTempAddressModal, updateAddress,
}: AddTempAddressToneProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    setError,
  } = useForm<CreateGuideAddressFormValuesTone>({
    resolver: yupResolver(CreateGuideAddressFormSchemaTone)
  })
  const clearManualAddressRegionFields = () => {
    setValue("neighborhood", "");
    setValue("state", "");
  };

  const {
    zipcode,
    setZipcode,
    neighborhoodSelected,
    setNeighborhoodSelected,
    stateSelected,
    setStateSelected,
    citySelected,
    setCitySelected,
    zipcodeError,
    validateZipcodeErrors,
    setZipcodeError,
    isValidNeighborhood,
  } = useAutocompleteZipcode({
    setValue,
    clearErrors,
    formData: addressData,
    syncCityForm: true,
    setError,
  });
  const { showManualFields, toggleShowManualFields } = useAddressRegionSelector({ clearManualAddressRegionFields })

  const onSubmit: SubmitHandler<CreateGuideAddressFormValuesTone> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    // We need to validate showManualFields because if user is using manual fields these validations are not necessary
    const isZipcodeValid = validateZipcodeErrors()
    if (!isZipcodeValid && !showManualFields) return

    const isNeighborhoodValid = isValidNeighborhood()
    if (!isNeighborhoodValid && !showManualFields) return

    delete data?.zipcode
    delete data?.city
    updateAddress(data)
    goNext()
  }

  const handleCancel = () => {
    toggleTempAddressModal()
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <PersonalDataForm<CreateGuideAddressFormValuesTone>
        addressData={addressData}
        errors={errors}
        register={register}
      />
      <section className="mt-8 flex flex-col gap-5">
        <h4 className="text-xl">Domicilio</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="street1">Calle</Label>
            </div>
            <TextInput
              data-testid="street1"
              defaultValue={addressData.street1}
              id="street1"
              type="text"
              {...register("street1")}
            />
            { errors?.street1?.message && (
              <ErrorMessage>{errors.street1?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="external_number">Numero exterior</Label>
            </div>
            <TextInput
              data-testid="external_number"
              defaultValue={addressData.external_number}
              id="external_number"
              type="text"
              inputMode="numeric"
              {...register("external_number")}
            />
            { errors?.external_number?.message && (
              <ErrorMessage>{errors.external_number?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="town">Municipio</Label>
            </div>
            <TextInput
              data-testid="town"
              defaultValue={addressData.town}
              id="town"
              type="text"
              {...register("town")}
            />
            { errors?.town?.message && (
              <ErrorMessage>{errors.town?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference">Referencia del domicilio (Opcional)</Label>
            </div>
            <TextInput
              data-testid="reference"
              defaultValue={addressData.reference ?? ''}
              id="reference"
              type="text"
              {...register("reference")}
            />
            { errors?.reference?.message && (
              <ErrorMessage>{errors.reference?.message}</ErrorMessage>
            )}
          </div>
          <AddressRegionSelector
            showManualFields={showManualFields}
            setShowManualFields={toggleShowManualFields}
            placeButton="bottom"
            ManualFieldsUI={
              <ManualFieldsTone
                addressData={addressData}
                errors={errors}
                register={register}
              />
            }
            AutocompleteUI={
              <AutocompleteZipcode
                zipcode={zipcode}
                setZipcode={setZipcode}
                zipcodeError={zipcodeError}
                setZipcodeError={setZipcodeError}
                neighborhood={neighborhoodSelected}
                setNeighborhood={setNeighborhoodSelected}
                neighborhoodError={errors?.neighborhood?.message ?? ""}
                state={stateSelected}
                setState={setStateSelected}
                stateError={errors?.state?.message ?? ""}
                city={citySelected}
                setCity={setCitySelected}
                cityError=""
                formData={addressData}
                hideCityField
              />
            }
          />
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button
          color="light"
          data-testid={`${addressType}-address-tone-temp-cancel-button`}
          className="hover:cursor-pointer"
          onClick={handleCancel}
        >
          Volver
        </Button>
        <Button data-testid={`${addressType}-address-tone-temp-next-button`} type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}