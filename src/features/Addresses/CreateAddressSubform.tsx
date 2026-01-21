"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CheckIcon,
  Label,
  Spinner,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import {
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form";

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { AddTag } from "@/shared/ui/organisms/AddTag";
import {
  CreateAddressFormValues,
  CreateAddressPayload,
  ManageAddressFormScreen,
} from "@/shared/types/addresses.types";
import { useAddTag } from "@/shared/hooks/useAddTag";
import { formatPayloadCreateAddress } from "@/shared/utils/addresses.utils";
import { convertToAddressDataGEFormValues } from "@/shared/utils/guides.utils";
import { AddressDataGEFormValues } from "@/shared/types/guides.types";
import { ErrorBanner } from "@/shared/ui/atoms/ErrorBanner";
import { AutocompleteZipcode } from "./AutocompleteZipcode";
import { AddressRegionFields } from "./AddressRegionFields";
import { AddressRegionSelector } from "./AddressRegionSelector ";
import { useAutocompleteZipcode } from "@/shared/hooks/useAutocompleteZipcode";

interface CreateAddressSubformProps {
  formData: CreateAddressPayload;
  isEdit: boolean;
  actionText: "Editar" | "Crear";
  errors: FieldErrors<CreateAddressFormValues>;
  register: UseFormRegister<CreateAddressFormValues>;
  handleSubmit: UseFormHandleSubmit<
    CreateAddressFormValues,
    CreateAddressFormValues
  >;
  setError: UseFormSetError<CreateAddressFormValues>;
  setValue: UseFormSetValue<CreateAddressFormValues>;
  createAddressMutation: (payload: CreateAddressPayload) => void;
  editAddressMutation: (payload: CreateAddressPayload) => void;
  isPending: boolean;
  isSuccess: boolean;
  isPendingEdit: boolean;
  isSuccessEdit: boolean;
  toggleModal: () => void;
  setSubscreen: (subscreen: ManageAddressFormScreen) => void;
  updateAddressDataGE: (data: AddressDataGEFormValues) => void;
  hasConsentedOnce: boolean;
  setHasConsentedOnce: (consented: boolean) => void;
  dataAliases: string[] | undefined;
  isPendingFetchAlias: boolean;
  errorAlias: Error | null;
}

export const CreateAddressSubform = ({
  formData,
  isEdit,
  actionText,
  errors,
  createAddressMutation,
  editAddressMutation,
  register,
  handleSubmit,
  setError,
  setValue,
  isPending,
  isSuccess,
  isPendingEdit,
  isSuccessEdit,
  toggleModal,
  setSubscreen,
  updateAddressDataGE,
  hasConsentedOnce,
  setHasConsentedOnce,
  dataAliases,
  isPendingFetchAlias,
  errorAlias,
}: CreateAddressSubformProps) => {
  console.log("errors", errors);
  // Create address in GE states
  const [shouldCreateGEAddress, setShouldCreateGEAddress] = useState(false);
  const [consentSkipGECreation, setConsentSkipGECreation] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  const handleShouldCreateGEAddress = () => {
    setShouldCreateGEAddress((prev) => {
      const nextValue = !prev;
      if (nextValue) {
        setConsentSkipGECreation(false);
      }
      return nextValue;
    });

    // Set that the user has consented at least once (outside the state updater)
    if (!shouldCreateGEAddress && !hasConsentedOnce) {
      setHasConsentedOnce(true);
    }
  };

  const handleConsentSkipGECreation = (isChecked: boolean) => {
    setConsentSkipGECreation(isChecked);
    if (showConsentError) setShowConsentError(false);
  };

  const [errorFetchAlias, setErrorFetchAlias] = useState<string | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);
  const toggleErrorBanner = () => setShowErrorBanner((prev) => !prev);

  // State for address region selector
  const [showManualFields, setShowManualFields] = useState(false);

  const {
    tags: towns,
    addTag: addTown,
    removeTag: removeTown,
    validateTagsEmpty: validateTownsEmpty,
    error: townsError,
    setError: setTownsError,
  } = useAddTag({ tagsInitState: formData?.town ?? [] });
  const {
    tags: cities,
    addTag: addCity,
    removeTag: removeCity,
    validateTagsEmpty: validateCitiesEmpty,
    error: citiesError,
    setError: setCitiesError,
  } = useAddTag({ tagsInitState: formData?.city ?? [] });
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
  });

  const submitButtonText = shouldCreateGEAddress
    ? "Siguiente"
    : `${actionText} dirección`;

  // Reset error if data is present
  useEffect(() => {
    if (Boolean(dataAliases) && errorFetchAlias) {
      setErrorFetchAlias(null);
      setShowErrorBanner(false);
    }
  }, [dataAliases, errorFetchAlias]);

  // Log error fetching alias addresses
  useEffect(() => {
    if (errorAlias) {
      console.error("Error fetching alias addresses from GE:", errorAlias);
      setErrorFetchAlias(
        "Ocurrió un error al obtener los alias. Por favor, intenta de nuevo más tarde.",
      );
      setShowErrorBanner(true);
    }
  }, [errorAlias]);

  const onSubmit: SubmitHandler<CreateAddressFormValues> = (data, event) => {
    event?.preventDefault();
    if (showConsentError) setShowConsentError(false);

    // Check if alias has been modified in edit mode
    if (isEdit && formData?.alias && data?.alias !== formData.alias) {
      setError("alias", {
        type: "manual",
        message: "El alias no puede ser editado",
      });
      return;
    }

    // Check if towns or cities are empty, if so, show error
    const townsEmpty = validateTownsEmpty();
    const citiesEmpty = validateCitiesEmpty();
    if (citiesEmpty && showManualFields) {
      setCitiesError("Debe agregar al menos una ciudad");
      return;
    }
    if (townsEmpty) {
      setTownsError("Debe agregar al menos un municipio");
    }

    const formattedPayload = formatPayloadCreateAddress({
      payload: data,
      cities,
      towns,
      isGEAddress: shouldCreateGEAddress,
      showManualFields,
      automaticZipcode: zipcode,
      neighborhoodSelected,
      stateSelected,
      citySelected,
    });

    // Edit address flow
    if (isEdit) {
      editAddressMutation(formattedPayload);
      return;
    }

    if (!shouldCreateGEAddress && !consentSkipGECreation) {
      setShowConsentError(true);
      return;
    }

    // If the address is created in GE, then the create address mutation will be executed in that screen
    if (shouldCreateGEAddress && !consentSkipGECreation) {
      // Check if alias exists in GE
      if (
        (dataAliases ?? []).find((aliasFetched) => aliasFetched === data.alias)
      ) {
        setError("alias", {
          type: "manual",
          message: "El alias ya existe en GE, por favor elija otro",
        });
        return;
      }

      const GEpayload = convertToAddressDataGEFormValues(data, cities);
      updateAddressDataGE(GEpayload);
      setSubscreen("ADD_GE_INFORMATION");
    }

    // Create the address anyway
    createAddressMutation(formattedPayload);
  };

  return (
    <div className="flex flex-col gap-5">
      {errorFetchAlias && showErrorBanner && (
        <ErrorBanner
          message={errorFetchAlias}
          toggleError={toggleErrorBanner}
        />
      )}
      <form className="flex flex-col gap-20" onSubmit={handleSubmit(onSubmit)}>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AddressRegionSelector
            ManualFieldsUI={
              <AddressRegionFields<CreateAddressFormValues>
                CityField={
                  <AddTag
                    label="cities"
                    text="Ciudades"
                    tags={cities}
                    addTag={addCity}
                    removeTag={removeCity}
                    placeholder="Presiona enter para agregar ciudades"
                    errorMessage={citiesError}
                    setError={setCitiesError}
                  />
                }
                addressData={formData}
                errors={errors}
                register={register}
              />
            }
            AutocompleteUI={
              <AutocompleteZipcode
                zipcode={zipcode}
                setZipcode={setZipcode}
                neighborhood={neighborhoodSelected}
                setNeighborhood={setNeighborhoodSelected}
                state={stateSelected}
                setState={setStateSelected}
                city={citySelected}
                setCity={setCitySelected}
              />
            }
            showManualFields={showManualFields}
            setShowManualFields={setShowManualFields}
          />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="street1">Calle</Label>
            </div>
            <TextInput
              data-testid="street1"
              defaultValue={formData.addressName}
              id="street1"
              type="text"
              {...register("street1")}
            />
            {errors?.street1?.message && (
              <ErrorMessage>{errors.street1?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="externalNumber">Numero exterior</Label>
            </div>
            <TextInput
              data-testid="externalNumber"
              id="externalNumber"
              type="text"
              defaultValue={formData.externalNumber}
              inputMode="numeric"
              {...register("externalNumber")}
            />
            {errors?.externalNumber?.message && (
              <ErrorMessage>{errors.externalNumber?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="internalNumber">Numero interior (Opcional)</Label>
            </div>
            <TextInput
              data-testid="internalNumber"
              defaultValue={formData.internalNumber as string}
              id="internalNumber"
              type="text"
              inputMode="numeric"
              {...register("internalNumber")}
            />
            {errors?.internalNumber?.message && (
              <ErrorMessage>{errors.internalNumber?.message}</ErrorMessage>
            )}
          </div>
          <AddTag
            label="towns"
            text="Municipios"
            tags={towns}
            addTag={addTown}
            removeTag={removeTown}
            placeholder="Presiona enter para agregar municipios"
            errorMessage={townsError}
            setError={setTownsError}
          />
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference">Referencia</Label>
            </div>
            <TextInput
              data-testid="reference"
              defaultValue={formData.reference as string}
              id="reference"
              type="text"
              {...register("reference")}
            />
            {errors?.reference?.message && (
              <ErrorMessage>{errors.reference?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="alias">Alias</Label>
            </div>
            <TextInput
              data-testid="alias"
              defaultValue={formData.alias}
              id="alias"
              type="text"
              {...register("alias")}
            />
            {errors?.alias?.message && (
              <ErrorMessage>{errors.alias?.message}</ErrorMessage>
            )}
          </div>
          <ToggleSwitch
            checked={shouldCreateGEAddress}
            label="Crear dirección en GE"
            onChange={handleShouldCreateGEAddress}
          />
          {!shouldCreateGEAddress && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={consentSkipGECreation}
                  onChange={(e) =>
                    handleConsentSkipGECreation(e.target.checked)
                  }
                />
                <Label htmlFor="remember">
                  Entiendo y acepto omitir en no crear esta dirección en GE
                </Label>
              </div>
              {showConsentError && (
                <div className="lg:col-start-2 lg:col-end-3 w-full flex justify-center">
                  <ErrorMessage>
                    Marque esta opcion para continuar.
                  </ErrorMessage>
                </div>
              )}
            </>
          )}
        </section>
        <div className="lg:col-span-2 flex justify-between mt-4">
          <Button
            color="red"
            outline
            data-testid="origin-address-cancel-button"
            className="hover:cursor-pointer"
            disabled={
              isPending ||
              isSuccess ||
              isPendingEdit ||
              isSuccessEdit ||
              isPendingFetchAlias
            }
            onClick={toggleModal}
          >
            Cancelar
          </Button>
          <Button
            data-testid="origin-address-next-button"
            type="submit"
            className="hover:cursor-pointer"
            disabled={isPending || isSuccess || isPendingEdit || isSuccessEdit}
          >
            {(isSuccess || isSuccessEdit) && <CheckIcon />}
            {(isPending || isPendingEdit) && (
              <Spinner aria-label={`loading ${actionText} kraft envios`} />
            )}
            {!isSuccess &&
              !isSuccessEdit &&
              !isPending &&
              !isPendingEdit &&
              submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
};
