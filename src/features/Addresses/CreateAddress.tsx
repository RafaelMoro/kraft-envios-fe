"use client"
import { Button, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react"

interface CreateAddressProps {
  open: boolean;
  toggleModal: () => void;
}

export const CreateAddress = ({ open, toggleModal }: CreateAddressProps) => {
  return (
    <Modal show={open} onClose={toggleModal}>
      <ModalHeader>Crear dirección</ModalHeader>
      <ModalBody>
        <form
          className="flex flex-col gap-5"
          // onSubmit={handleSubmit(onSubmit)}
        >
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
              <Label htmlFor="external_number">Numero exterior</Label>
            </div>
            <TextInput
              data-testid="external_number"
              // defaultValue={addressData.external_number}
              id="external_number"
              type="text"
              inputMode="numeric"
              // {...register("external_number")}
            />
            {/* { errors?.external_number?.message && (
              <ErrorMessage>{errors.external_number?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="internal_number">Numero interior (Opcional)</Label>
            </div>
            <TextInput
              data-testid="internal_number"
              // defaultValue={addressData.internal_number}
              id="internal_number"
              type="text"
              inputMode="numeric"
              // {...register("internal_number")}
            />
            {/* { errors?.internal_number?.message && (
              <ErrorMessage>{errors.internal_number?.message}</ErrorMessage>
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
              <Label htmlFor="town">Municipio</Label>
            </div>
            <TextInput
              data-testid="town"
              // defaultValue={addressData.town}
              id="town"
              type="text"
              // {...register("town")}
            />
            {/* { errors?.town?.message && (
              <ErrorMessage>{errors.town?.message}</ErrorMessage>
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
              <Label htmlFor="reference">Referencia</Label>
            </div>
            <TextInput
              data-testid="reference"
              // defaultValue={addressData.reference}
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
              <Label htmlFor="alias">Alias</Label>
            </div>
            <TextInput
              data-testid="alias"
              // defaultValue={addressData.alias}
              id="alias"
              type="text"
              // {...register("alias")}
            />
            {/* { errors?.alias?.message && (
              <ErrorMessage>{errors.alias?.message}</ErrorMessage>
            )} */}
          </div>
          <div className="flex justify-between mt-4">
            <Button
              // {...(!isDestination && { outline: true })}
              color="red"
              data-testid="origin-address-cancel-button"
              className="hover:cursor-pointer"
              // onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
              Crear dirección
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}