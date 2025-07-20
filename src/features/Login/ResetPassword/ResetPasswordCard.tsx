import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { Button, Card, Label, TextInput } from "flowbite-react"

interface ResetPasswordCardProps{
  slug: string
}

export const ResetPasswordCard = ({ slug }: ResetPasswordCardProps) => {
  console.log('slug', slug)
  return (
    <Card className="max-w-[400px]">
      <p className="text-xl text-black dark:text-white mb-2">
        Ingresa y confirma tu nueva contraseña para recuperar el acceso.
      </p>
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password">Nueva Contraseña</Label>
          </div>
          <TextInput
            data-testid="password"
            id="password"
            type="password"
            // {...register("password")}
          />
          {/* { errors?.password?.message && (
            <ErrorMessage isAnimated>{errors.password?.message}</ErrorMessage>
          )} */}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          </div>
          <TextInput
            data-testid="confirmPassword"
            type="password"
            id="confirmPassword"
            // {...register("confirmPassword")}
          />
          {/* { errors?.confirmPassword?.message && (
            <ErrorMessage isAnimated>{errors.confirmPassword?.message}</ErrorMessage>
          )} */}
        </div>
        <LinkButton className="mt-4" type="secondary" href={LOGIN_ROUTE} >Volver al inicio</LinkButton>
        <Button
          className="hover:cursor-pointer"
          // disabled={isPending || isSuccess}
          type="submit"
        >
          Reestablecer contraseña
          {/* { (isIdle || isError) && 'Reestablecer contraseña'}
          { isPending && (<Spinner aria-label="loading reset password budget master" />) }
          { isSuccess && (<CheckIcon />)} */}
        </Button>
      </form>
    </Card>
  )
}