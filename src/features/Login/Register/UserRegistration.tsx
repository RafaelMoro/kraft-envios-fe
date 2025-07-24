import { UserAndPasswordSchema, UserPasswordForm } from "@/shared/types/login.types";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form";

interface UserRegistrationProps {
  isLoading: boolean;
  goPrev: () => void;
  submitForm: () => void;
  updateUserPasswordInfo: (data: UserPasswordForm) => void;
}

export const UserRegistration = ({ goPrev, submitForm, updateUserPasswordInfo, isLoading }: UserRegistrationProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserPasswordForm>({
    resolver: yupResolver(UserAndPasswordSchema)
  })

  const onSubmit: SubmitHandler<UserPasswordForm> = (data) => {
    updateUserPasswordInfo(data)
    submitForm()
  }

  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Crear cuenta.
      </h5>
      <p className="text-xl text-black dark:text-white">Ingrese su correo electronico y contraseña.</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Correo electrónico</Label>
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
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <TextInput
            data-testid="password"
            id="password"
            type="password"
            {...register("password")}
          />
          { errors?.password?.message && (
            <ErrorMessage>{errors.password?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          </div>
          <TextInput
            data-testid="confirmPassword"
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
          />
          { errors?.confirmPassword?.message && (
            <ErrorMessage>{errors.confirmPassword?.message}</ErrorMessage>
          )}
        </div>
        <Button className="hover:cursor-pointer" outline onClick={goPrev}>Regresar</Button>
        <Button
          disabled={isLoading}
          aria-disabled={isLoading}
          type="submit"
          className="hover:cursor-pointer disabled:opacity-50 inline-flex gap-3"
        >
          { isLoading && (
            <>
              <Spinner aria-label="loading creating user" light />
              Creando usuario...
            </>
          )}
          { !isLoading && 'Crear cuenta' }
        </Button>
      </form>
    </Card>
  )
}