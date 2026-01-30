import { yupResolver } from "@hookform/resolvers/yup"
import { Button, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

import { AddressType, CreateGuideAddressFormSchemaMn, CreateGuideAddressFormValuesMn } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { PersonalDataForm } from "../PersonalDataForm"
import { AutocompleteZipcode } from "@/features/Addresses/AutocompleteZipcode"
import { useAutocompleteZipcode } from "@/shared/hooks/useAutocompleteZipcode"

interface OriginAddressFormProps {
  title: string
  addressData: CreateGuideAddressFormValuesMn
  addressType: AddressType
  isMobileTablet: boolean
  goNext: () => void
  updateAddress: (data: CreateGuideAddressFormValuesMn) => void
  toggleTempAddress: () => void
}

export const AddTempAddressMn = ({ addressData, addressType, title, isMobileTablet, goNext, updateAddress, toggleTempAddress }: OriginAddressFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    setError,
  } = useForm<CreateGuideAddressFormValuesMn>({
    resolver: yupResolver(CreateGuideAddressFormSchemaMn)
  })
  const clearManualAddressRegionFields = () => {
    setValue("neighborhood", "");
    setValue("state", "");
    setValue("city", "");
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

  const onSubmit: SubmitHandler<CreateGuideAddressFormValuesMn> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()
    updateAddress(data)
    goNext()
  }

  const handleCancel = () => {
    toggleTempAddress()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      { isMobileTablet && (<h5 className="text-xl font-bold text-center mb-5">{title}</h5>)}
      <h4 className="text-xl">Datos personales</h4>
      <PersonalDataForm<CreateGuideAddressFormValuesMn>
        addressData={addressData}
        errors={errors}
        register={register}
      />
      <div className="mt-8 flex flex-col gap-5">
        <h4 className="text-xl">Domicilio</h4>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            cityError={errors?.city?.message ?? ""}
            formData={addressData}
          />
        </section>
      </div>
      <div className="flex justify-between mt-4">
        <Button color="light" data-testid={`${addressType}-address-mn-temp-cancel-button`} className="hover:cursor-pointer" onClick={handleCancel}>
          Volver
        </Button>
        <Button data-testid={`${addressType}-address-mn-temp-next-button`} type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}