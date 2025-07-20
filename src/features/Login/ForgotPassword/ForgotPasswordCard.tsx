"use client"
import { Button, Card, Label, TextInput } from "flowbite-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { SubmitHandler, useForm } from "react-hook-form"

import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { ForgotPasswordPayload, ForgotPasswordSchema } from "@/shared/types/login.types"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

export const ForgotPasswordCard = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordPayload>({
    resolver: yupResolver(ForgotPasswordSchema)
  })

  const onSubmit: SubmitHandler<ForgotPasswordPayload> = async (data) => {
    console.log('data', data)
  }

  return (
    <Card className="max-w-[400px]">
      <p className="text-xl text-black dark:text-white mb-2">Escribe tu correo electrónico y te enviaremos los pasos para restablecer tu contraseña al instante.</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
            {...register("email")}
            />
          { errors.email?.message && (
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
          )}
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