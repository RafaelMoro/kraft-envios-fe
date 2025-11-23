import { useEffect, useState } from "react"
import { Button, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import { SelectAliasGE } from "./SelectAlias"
import { CreateAddressFormValuesGE, CreateAddressGEPayload, CreateAddressGEResponse, CreateAddressGESchema, CreateGuideAddressValuesGE } from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { useMutation, useQuery } from "@tanstack/react-query"
import { GeneralApiError } from "@/shared/types/global.types"
import { convertToCreateAddressGEPayload, createAddressGECb, getAliasAddressesCb } from "@/shared/utils/guides.utils"
import { ErrorBanner } from "@/shared/ui/atoms/ErrorBanner"

interface CreateGuideAddressFormGEProps {
  typeAddress: 'origin' | 'destination';
  errorSelectAlias: string | null;
  addressData: CreateGuideAddressValuesGE;
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressValuesGE) => boolean
}

export const CreateGuideAddressFormGE = ({
  typeAddress, errorSelectAlias, addressData, goPrev, goNext, toggleModal, updateAddress
}: CreateGuideAddressFormGEProps) => {
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null)
  const [showErrorOnCreateAddr, setShowErrorOnCreateAddr] = useState<boolean>(false)
  const toggleErrorOnCreateAddr = () => setShowErrorOnCreateAddr((prev) => !prev)
  const [showForm, setShowForm] = useState<boolean>(false)
  const toggleShowForm = () => setShowForm((prev) => !prev)

  const typeAddressLabel = typeAddress === 'origin' ? 'origen' : 'destino'
  const cancelButtonText = typeAddress === 'destination' ? 'Regresar' : 'Cancelar'

  useEffect(() => {
    if (addressData.alias) {
      setSelectedAlias(addressData.alias)
    }
  }, [addressData.alias])

  const handleCancel = () => {
    if (typeAddress === 'destination') {
      goPrev()
      return;
    }

    toggleModal()
  }

  const handleNextStep = () => {
    // save info
    if (!selectedAlias) {
      // show error
      return;
    }

    const canGoNext = updateAddress({ alias: selectedAlias })
    if (canGoNext) {
      goNext()
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAddressFormValuesGE>({
    resolver: yupResolver(CreateAddressGESchema)
  })

  const { data, refetch: refetchFetchAlias,  isPending: isPendingFetchAlias, isError: isErrorFetchAlias } = useQuery({
    queryKey: ['aliasAddresses'],
    queryFn: getAliasAddressesCb
  })

  const { mutate: createAddress, isPending: isPendingCreateAddress } = useMutation<CreateAddressGEResponse, GeneralApiError, CreateAddressGEPayload>({
    mutationFn: createAddressGECb,
    onSuccess: () => {
      toggleShowForm()
      refetchFetchAlias()
    },
    onError: () => {
      toggleShowForm()
      toggleErrorOnCreateAddr()
    }
  })

  const onSubmit: SubmitHandler<CreateAddressFormValuesGE> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    const payload = convertToCreateAddressGEPayload(data)
    createAddress(payload)
  }

  if (showForm) {
    return (
      <form
        className="p-4 overflow-y-auto flex flex-col gap-5"
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
              <Label htmlFor="phone">Teléfono</Label>
            </div>
            <TextInput
              data-testid="phone"
              id="phone"
              type="text"
              inputMode="numeric"
              {...register("phone")}
            />
            { errors?.phone?.message && (
              <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email">Correo electrónico (Opcional)</Label>
            </div>
            <TextInput
              id="email"
              type="email"
              {...register("email")}
            />
            { errors?.email?.message && (
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="company">Nombre de la compañia (Opcional)</Label>
            </div>
            <TextInput
              data-testid="company"
              id="company"
              type="text"
              {...register("company")}
            />
            { errors?.company?.message && (
              <ErrorMessage>{errors.company?.message}</ErrorMessage>
            )}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="rfc">RFC (Opcional)</Label>
            </div>
            <TextInput
              data-testid="rfc"
              id="rfc"
              type="text"
              {...register("rfc")}
            />
            { errors?.rfc?.message && (
              <ErrorMessage>{errors.rfc?.message}</ErrorMessage>
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
                <Label htmlFor="number">Número de Calle</Label>
              </div>
              <TextInput
                id="number"
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
                <Label htmlFor="neighborhood">Colonia</Label>
              </div>
              <TextInput
                data-testid="neighborhood"
                id="neighborhood"
                type="text"
                {...register("neighborhood")}
              />
              { errors?.neighborhood?.message && (
                <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="town">Ciudad</Label>
              </div>
              <TextInput
                data-testid="city"
                id="city"
                type="text"
                {...register("city")}
              />
              { errors?.city?.message && (
                <ErrorMessage>{errors.city?.message}</ErrorMessage>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="state">Estado de la República</Label>
              </div>
              <TextInput
                data-testid="state"
                id="state"
                type="text"
                {...register("state")}
              />
              { errors?.state?.message && (
                <ErrorMessage>{errors.state?.message}</ErrorMessage>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="zipcode">Código Postal</Label>
              </div>
              <TextInput
                id="zipcode"
                type="text"
                inputMode="numeric"
                {...register("zipcode")}
              />
              { errors?.zipcode?.message && (
                <ErrorMessage>{errors.zipcode?.message}</ErrorMessage>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="alias">Alias del domicilio</Label>
              </div>
              <TextInput
                data-testid="alias"
                id="alias"
                type="text"
                {...register("alias")}
              />
              { errors?.alias?.message && (
                <ErrorMessage>{errors.alias?.message}</ErrorMessage>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="reference">Referencia del domicilio (Opcional)</Label>
              </div>
              <TextInput
                data-testid="reference"
                id="reference"
                type="text"
                {...register("reference")}
              />
              { errors?.reference?.message && (
                <ErrorMessage>{errors.reference?.message}</ErrorMessage>
              )}
            </div>
          </section>
        </div>
        <div className="flex justify-between mt-4">
        <Button
          outline
          color="red"
          data-testid={`${typeAddress}-cancel-button`}
          className="hover:cursor-pointer"
          onClick={toggleShowForm}
        >
          Cancelar
        </Button>
        <Button disabled={isPendingCreateAddress} data-testid="create-address-ge-button" type="submit" className="hover:cursor-pointer">
          { isPendingCreateAddress ? (<Spinner />) : 'Guardar dirección' }
        </Button>
      </div>
      </form>
    )
  }

  return (
    <article className="p-4 flex flex-col gap-5">
      { showErrorOnCreateAddr && (
        <ErrorBanner
          message="Hubo un error al crear la nueva dirección. Intente nuevamente más tarde."
          toggleError={toggleErrorOnCreateAddr}
        />
      )}
      <p className="text-lg">Seleccione un alias para la dirección de {typeAddressLabel}. Si no existe el alias de su dirección, puede crear uno nuevo dando click en &quot;Agregar nueva dirección&quot;.</p>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <SelectAliasGE
            data={data}
            isPending={isPendingFetchAlias}
            isError={isErrorFetchAlias}
            alias={selectedAlias}
            setAlias={setSelectedAlias}
          />
          { errorSelectAlias && (
            <ErrorMessage>{errorSelectAlias}</ErrorMessage>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Button color="light" onClick={toggleShowForm}>Agregar nueva dirección</Button>
          <Button
            outline
            color="red"
            onClick={handleCancel}
          >{cancelButtonText}</Button>
          <Button disabled={!selectedAlias} onClick={handleNextStep}>Siguiente</Button>
        </div>
      </div>
      
    </article>
  )
}