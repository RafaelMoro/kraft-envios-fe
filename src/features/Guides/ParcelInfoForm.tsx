"use client"
import { Button, Label, TextInput } from "flowbite-react"

export const ParcelInfoForm = () => {
  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-4">
        <p>Dropdown sat product id</p>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="content">Contenido del paquete</Label>
          </div>
          <TextInput
            data-testid="content"
            // defaultValue={addressData.name}
            id="content"
            type="text"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="value">Valor del paquete</Label>
          </div>
          <TextInput
            data-testid="value"
            // defaultValue={addressData.name}
            id="value"
            type="number"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="quantity">Cantidad</Label>
          </div>
          <TextInput
            data-testid="quantity"
            // defaultValue={addressData.name}
            id="quantity"
            type="number"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button
          color="light"
          data-testid="parcel-info-form-cancel-button"
          className="hover:cursor-pointer"
          // onClick={handleCancel}
        >
          Regresar
        </Button>
        <Button data-testid="parcel-info-form-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}