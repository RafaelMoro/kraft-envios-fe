import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { PersonalInformationForm, PersonalInformationSchema } from "@/shared/types/login.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button, Card, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"

interface PersonalInformationProps {
  personalInformation: PersonalInformationForm;
  goNext: () => void
  updatePersonalInformation: (data: PersonalInformationForm) => void
}

export const PersonalInformation = ({ personalInformation, goNext, updatePersonalInformation }: PersonalInformationProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInformationForm>({
    resolver: yupResolver(PersonalInformationSchema)
  })

  const onSubmit: SubmitHandler<PersonalInformationForm> = (data) => {
    updatePersonalInformation(data)
    goNext()
  }

  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Crear cuenta.
      </h5>
      <p className="text-xl text-black dark:text-white">Llene la siguiente información para crear su cuenta.</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="firstName">Nombre</Label>
          </div>
          <TextInput
            data-testid="firstName"
            defaultValue={personalInformation.name}
            id="firstName" type="text"
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
            id="lastName"
            defaultValue={personalInformation.lastName}
            type="text"
            {...register("lastName")}
          />
          { errors?.lastName?.message && (
            <ErrorMessage>{errors?.lastName?.message}</ErrorMessage>
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
            defaultValue={personalInformation.phone ?? ''}
            {...register("phone")}
          />
          { errors?.phone?.message && (
            <ErrorMessage>{errors?.phone?.message}</ErrorMessage>
          )}
        </div>
        <LinkButton type="secondary" href={LOGIN_ROUTE} >Volver</LinkButton>
        <Button type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </form>
    </Card>
  )
}