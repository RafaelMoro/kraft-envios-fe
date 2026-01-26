import { useState } from "react"
import { Button, Label, TextInput, ToggleSwitch } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import {
  AddressType,
  CreateGuideAddressFormSchemaPkk,
  CreateGuideAddressFormValuesPkk,
  CreateGuideAddressValuesPkk,
} from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { useAutocompleteZipcode } from "@/shared/hooks/useAutocompleteZipcode"
import { AutocompleteZipcode } from "@/features/Addresses/AutocompleteZipcode"
import { useAddressRegionSelector } from "@/shared/hooks/useAddressRegionSelector"
import { AddressRegionSelector } from "@/features/Addresses/AddressRegionSelector "
import { AddressRegionFields } from "@/features/Addresses/AddressRegionFields"

interface AddTempAddressPkkProps {
  addressData: CreateGuideAddressValuesPkk;
  addressType: AddressType
  goNext: () => void
  toggleTempAddress: () => void
  updateAddress: (data: CreateGuideAddressValuesPkk) => void
}

export const AddTempAddressPkk = ({
  addressData, addressType, goNext, toggleTempAddress, updateAddress: updateOriginAddress,
}: AddTempAddressPkkProps) => {
  const [isResidential, setIsResidential] = useState(addressData.isResidential);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateGuideAddressFormValuesPkk>({
    resolver: yupResolver(CreateGuideAddressFormSchemaPkk)
  })
  const setZipcodeError = (error: string) => {
    setError("zipcode", { type: "manual", message: error });
  };
  const clearManualAddressRegionFields = () => {
    setValue("zipcode", "");
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
  } = useAutocompleteZipcode({
    setValue,
    clearErrors,
    formData: addressData,
    syncCityForm: true,
  });
  const { showManualFields, toggleShowManualFields } = useAddressRegionSelector({ clearManualAddressRegionFields })

  const onSubmit: SubmitHandler<CreateGuideAddressFormValuesPkk> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    const updatedData: CreateGuideAddressValuesPkk = { ...data, isResidential }
    updateOriginAddress(updatedData)
    goNext()
  }

  const handleCancel = () => {
    toggleTempAddress()
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-xl">Datos personales</h4>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Nombre</Label>
          </div>
          <TextInput
            data-testid="name"
            defaultValue={addressData.name}
            id="name"
            type="text"
            {...register("name")}
          />
          { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="lastName">Apellido</Label>
          </div>
          <TextInput
            data-testid="lastName"
            defaultValue={addressData.lastName}
            id="lastName"
            type="text"
            {...register("lastName")}
          />
          { errors?.lastName?.message && (
            <ErrorMessage>{errors.lastName.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Correo electrónico (Opcional)</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            defaultValue={addressData.email ?? ''}
            {...register("email")}
          />
          { errors?.email?.message && (
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="phone">Teléfono</Label>
          </div>
          <TextInput
            data-testid="phone"
            id="phone"
            type="text"
            inputMode="numeric"
            defaultValue={addressData.phone}
            {...register("phone")}
          />
          { errors?.phone?.message && (
            <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
          )}
        </div>
      </section>
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
          <AddressRegionSelector
            showManualFields={showManualFields}
            setShowManualFields={toggleShowManualFields}
            placeButton="bottom"
            ManualFieldsUI={
              <AddressRegionFields<CreateGuideAddressFormValuesPkk>
                CityField={
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="town">Ciudad</Label>
                    </div>
                    <TextInput
                      data-testid="city"
                      defaultValue={addressData.city}
                      id="city"
                      type="text"
                      {...register("city")}
                    />
                    { errors?.city?.message && (
                      <ErrorMessage>{errors.city?.message}</ErrorMessage>
                    )}
                  </div>
                }
                addressData={addressData}
                errors={errors}
                register={register}
              />
            }
            AutocompleteUI={
              <AutocompleteZipcode
                zipcode={zipcode}
                setZipcode={setZipcode}
                zipcodeError={errors?.zipcode?.message ?? ""}
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
            }
          />
          <div className="justify-self-start self-center">
            <ToggleSwitch checked={isResidential} label="Es residencial" onChange={setIsResidential} />
          </div>
        </section>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          color="light"
          data-testid={`${addressType}-address-pkk-temp-cancel-button`}
          className="hover:cursor-pointer"
          onClick={handleCancel}
        >
          Volver
        </Button>
        <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}