import { Button, Card, Label, TextInput } from "flowbite-react"

interface CompanyDetailsProps {
  goPrev: () => void;
}

export const CompanyDetails = ({ goPrev }: CompanyDetailsProps) => {
  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Crear cuenta.
      </h5>
      <p className="text-xl text-black dark:text-white">Llene la siguiente información para crear su cuenta.</p>
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="firstName">Nombre</Label>
          </div>
          <TextInput
            data-testid="firstName"
            // defaultValue={personalInformation.firstName}
            id="firstName" type="text"
            // {...register("firstName")}
          />
          {/* { errors?.firstName?.message && (
            <ErrorMessage>{errors.firstName?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="lastName">Apellido</Label>
          </div>
          <TextInput
            id="lastName"
            // defaultValue={personalInformation.lastName}
            type="text"
            // {...register("lastName")}
          />
          {/* { errors?.lastName?.message && (
            <ErrorMessage>{errors?.lastName?.message}</ErrorMessage>
          )} */}
        </div>
        <Button className="hover:cursor-pointer" outline onClick={goPrev}>Regresar</Button>
        <Button type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </form>
    </Card>
  )
}