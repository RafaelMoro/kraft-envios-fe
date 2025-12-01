import { Label, TextInput } from "flowbite-react"

export const PersonalDataTone = () => {
  return (
    <>
      <h4 className="text-xl">Datos personales</h4>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Nombre</Label>
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
            <Label htmlFor="lastName">Apellido</Label>
          </div>
          <TextInput
            data-testid="lastName"
            // defaultValue={addressData.lastName}
            id="lastName"
            type="text"
            // {...register("lastName")}
          />
          {/* { errors?.lastName?.message && (
            <ErrorMessage>{errors.lastName?.message}</ErrorMessage>
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
      </section>
    </>
  )
}