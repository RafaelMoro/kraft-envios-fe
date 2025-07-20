import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { Button, Card, Label, TextInput } from "flowbite-react"

export const ForgotPasswordCard = () => {
  return (
    <Card className="max-w-[400px]">
      <p className="text-xl text-black dark:text-white mb-2">Escribe tu correo electrónico y te enviaremos los pasos para restablecer tu contraseña al instante.</p>
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Correo Electrónico</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            placeholder="correo-electrónico@gmail.com"
            // {...register("email")}
            />
          {/* { errors.email?.message && (
            <ErrorMessage isAnimated>{errors.email?.message}</ErrorMessage>
          )} */}
        </div>
        <LinkButton className="mt-4" type="secondary" href={LOGIN_ROUTE}>
          Volver
        </LinkButton>
        <Button
          className="hover:cursor-pointer"
          // disabled={isPending || isSuccess}
          type="submit"
        >
          Enviar
        </Button>
      </form>
    </Card>
  )
}