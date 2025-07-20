import { Card, Label, TextInput } from "flowbite-react"

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
      </form>
    </Card>
  )
}