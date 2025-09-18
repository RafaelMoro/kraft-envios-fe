import { Button, Label, TextInput } from "flowbite-react"

export const OriginAddressForm = () => {
  return (
    <form>
      <section className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Nombre de la persona</Label>
          </div>
          <TextInput
            data-testid="name"
            // defaultValue={personalInformation.name}
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
            <Label htmlFor="street1">Calle</Label>
          </div>
          <TextInput
            data-testid="street1"
            // defaultValue={personalInformation.name}
            id="street1"
            type="text"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="neighborhood">Colonia</Label>
          </div>
          <TextInput
            data-testid="neighborhood"
            // defaultValue={personalInformation.name}
            id="neighborhood"
            type="text"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="external_number">Numero exterior</Label>
          </div>
          <TextInput
            data-testid="external_number"
            // defaultValue={personalInformation.name}
            id="external_number"
            type="number"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="city">Ciudad</Label>
          </div>
          <TextInput
            data-testid="city"
            // defaultValue={personalInformation.name}
            id="city"
            type="text"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="company">Nombre de la compañia</Label>
          </div>
          <TextInput
            data-testid="company"
            // defaultValue={personalInformation.name}
            id="company"
            type="text"
            // {...register("name")}
          />
          {/* { errors?.name?.message && (
            <ErrorMessage>{errors.name?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="state">Estado de la República</Label>
          </div>
          <TextInput
            data-testid="state"
            // defaultValue={personalInformation.name}
            id="state"
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
            // defaultValue={personalInformation.phone ?? ''}
            // {...register("phone")}
          />
          {/* { errors?.phone?.message && (
            <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Correo electrónico</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            // {...register("email")}
          />
          {/* { errors?.email?.message && (
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="reference">Referencia del domicilio (Opcional)</Label>
          </div>
          <TextInput
            data-testid="reference"
            // defaultValue={companyDetails.companyName ?? ''}
            id="reference"
            type="text"
            // {...register("companyName")}
          />
          {/* { errors?.companyName?.message && (
            <ErrorMessage>{errors.companyName?.message}</ErrorMessage>
          )} */}
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button outline color="red" data-testid="origin-address-cancel-button" className="hover:cursor-pointer">
          Cancelar
        </Button>
        <Button data-testid="origin-address-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}