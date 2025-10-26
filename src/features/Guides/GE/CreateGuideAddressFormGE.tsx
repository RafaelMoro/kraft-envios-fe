import { useState } from "react"
import { Button, Label, TextInput } from "flowbite-react"

import { SelectAliasGE } from "./SelectAlias"

interface CreateGuideAddressFormGEProps {
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  typeAddress: 'origin' | 'destination';
}

export const CreateGuideAddressFormGE = ({ typeAddress, goPrev, goNext, toggleModal }: CreateGuideAddressFormGEProps) => {
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<boolean>(false)
  const toggleShowForm = () => setShowForm((prev) => !prev)

  const typeAddressLabel = typeAddress === 'origin' ? 'origen' : 'destino'
  const cancelButtonText = typeAddress === 'destination' ? 'Regresar' : 'Cancelar'

  const handleCancel = () => {
    if (typeAddress === 'destination') {
      goPrev()
      return;
    }

    toggleModal()
  }

  const handleNextStep = () => {
    // save info
    goNext()
  }

  if (showForm) {
    return (
      <form
        className="p-4 overflow-y-auto"
        // onSubmit={handleSubmit(onSubmit)}
      >
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name">Nombre de la persona</Label>
            </div>
            <TextInput
              data-testid="name"
              // defaultValue={addressData.name}
              id="name"
              type="text"
              // {...register("name")}
            />
            {/* { errors?.name?.message && (
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            )} */}
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
              // defaultValue={addressData.phone}
              // {...register("phone")}
            />
            {/* { errors?.phone?.message && (
              <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email">Correo electrónico (Opcional)</Label>
            </div>
            <TextInput
              id="email"
              type="email"
              // defaultValue={addressData.email ?? ''}
              // {...register("email")}
            />
            {/* { errors?.email?.message && (
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="company">Nombre de la compañia (Opcional)</Label>
            </div>
            <TextInput
              data-testid="company"
              // defaultValue={addressData.company ?? ''}
              id="company"
              type="text"
              // {...register("company")}
            />
            {/* { errors?.company?.message && (
              <ErrorMessage>{errors.company?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="rfc">RFC (Opcional)</Label>
            </div>
            <TextInput
              data-testid="rfc"
              // defaultValue={addressData.rfc ?? ''}
              id="rfc"
              type="text"
              // {...register("rfc")}
            />
            {/* { errors?.rfc?.message && (
              <ErrorMessage>{errors.rfc?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="street1">Calle</Label>
            </div>
            <TextInput
              data-testid="street1"
              // defaultValue={addressData.street1}
              id="street1"
              type="text"
              // {...register("street1")}
            />
            {/* { errors?.street1?.message && (
              <ErrorMessage>{errors.street1?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="number">Número de Calle</Label>
            </div>
            <TextInput
              id="number"
              type="text"
              inputMode="numeric"
              // {...register("number")}
            />
            {/* { errors?.number?.message && (
              <ErrorMessage>{errors.number?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="neighborhood">Colonia</Label>
            </div>
            <TextInput
              data-testid="neighborhood"
              // defaultValue={addressData.neighborhood}
              id="neighborhood"
              type="text"
              // {...register("neighborhood")}
            />
            {/* { errors?.neighborhood?.message && (
              <ErrorMessage>{errors.neighborhood?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="town">Ciudad</Label>
            </div>
            <TextInput
              data-testid="city"
              // defaultValue={addressData.city}
              id="city"
              type="text"
              // {...register("city")}
            />
            {/* { errors?.city?.message && (
              <ErrorMessage>{errors.city?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="state">Estado de la República</Label>
            </div>
            <TextInput
              data-testid="state"
              // defaultValue={addressData.state}
              id="state"
              type="text"
              // {...register("state")}
            />
            {/* { errors?.state?.message && (
              <ErrorMessage>{errors.state?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="zipcode">Código Postal</Label>
            </div>
            <TextInput
              id="zipcode"
              type="text"
              inputMode="numeric"
              // {...register("zipcode")}
            />
            {/* { errors?.zipcode?.message && (
              <ErrorMessage>{errors.zipcode?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference">Referencia del domicilio (Opcional)</Label>
            </div>
            <TextInput
              data-testid="reference"
              // defaultValue={addressData.reference ?? ''}
              id="reference"
              type="text"
              // {...register("reference")}
            />
            {/* { errors?.reference?.message && (
              <ErrorMessage>{errors.reference?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="alias">Alias del domicilio</Label>
            </div>
            <TextInput
              data-testid="alias"
              // defaultValue={addressData.alias ?? ''}
              id="alias"
              type="text"
              // {...register("alias")}
            />
            {/* { errors?.alias?.message && (
              <ErrorMessage>{errors.alias?.message}</ErrorMessage>
            )} */}
          </div>
        </section>
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
        <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
          Guardar dirección
        </Button>
      </div>
      </form>
    )
  }

  return (
    <article className="p-4 flex flex-col gap-5">
      <p className="text-lg">Seleccione un alias para la dirección de {typeAddressLabel}. Si no existe el alias de su dirección, puede crear uno nuevo dando click en &quot;Agregar nueva dirección&quot;.</p>
      <div className="flex flex-col gap-16">
        <SelectAliasGE alias={selectedAlias} setAlias={setSelectedAlias} />
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