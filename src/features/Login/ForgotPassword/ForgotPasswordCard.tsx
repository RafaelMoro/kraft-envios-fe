"use client"
import { useRouter } from 'next/navigation'
import { Button, Card, CheckIcon, Label, Spinner, TextInput } from "flowbite-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { SubmitHandler, useForm } from "react-hook-form"

import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { ForgotPasswordData, ForgotPasswordError, ForgotPasswordPayload, ForgotPasswordSchema } from "@/shared/types/login.types"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { useMutation } from "@tanstack/react-query"
import { forgotPasswordCb } from "@/shared/utils/login.utils"
import { GeneralError } from '@/shared/types/global.types'

export const ForgotPasswordCard = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordPayload>({
    resolver: yupResolver(ForgotPasswordSchema)
  })

  const { mutate: forgotPwdMutation, isError, isPending, isSuccess, isIdle, error } = useMutation<ForgotPasswordData, ForgotPasswordError, ForgotPasswordPayload>({
    mutationFn: forgotPasswordCb,
    onSuccess: () => {
      setTimeout(() => {
        router.push(LOGIN_ROUTE)
      }, 1000)
    }
  })
  const messageError = (error as unknown as GeneralError)?.response?.data?.error?.message

  const onSubmit: SubmitHandler<ForgotPasswordPayload> = async (data) => {
    forgotPwdMutation(data)
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
          disabled={isPending || isSuccess}
          type="submit"
        >
          { (isIdle || isError) && 'Enviar'}
          { isPending && (<Spinner aria-label="loading forgot password" />) }
          { isSuccess && (<CheckIcon />)}
        </Button>
      </form>
    </Card>
  )
}