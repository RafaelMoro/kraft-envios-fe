"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button, Card, CheckIcon, Label, Spinner, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

import { DASHBOARD_ROUTE, FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/shared/constants/global.constants"
import { LinkButton } from "../../shared/ui/atoms/LinkButton"
import { LoginData, LoginError, LoginPayload, LoginSchema } from "../../shared/types/login.types"
import { ErrorMessage } from "../../shared/ui/atoms/ErrorMessage"
import { LoginMutationCb } from "@/shared/utils/login.utils"
import { ERROR_CREATE_USER_TITLE, ERROR_UNAUTHORIZED_LOGIN, ERROR_UNAUTHORIZED_LOGIN_MESSAGE } from "@/shared/constants/login.constants"

interface LoginCardProps {
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
}

export const LoginCard = ({ toggleNotification, updateNotificationMessage }: LoginCardProps) => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: yupResolver(LoginSchema)
  })

  const { mutate: loginMutation, isError, isPending, isSuccess, isIdle, error } = useMutation<LoginData, LoginError, LoginPayload>({
    mutationFn: LoginMutationCb,
    onSuccess: () => {
      setTimeout(() => {
        router.push(DASHBOARD_ROUTE)
      }, 1000)
    }
  })
  const messageError = error?.response?.data?.message

  const onSubmit: SubmitHandler<LoginPayload> = (data) => {
    const dataForm = {
      email: data.email,
      password: data.password
    }
    loginMutation(dataForm)
  }

  useEffect(() => {
    if (isError && messageError) {
      if (messageError === ERROR_UNAUTHORIZED_LOGIN) {
        toggleNotification()
        updateNotificationMessage(ERROR_UNAUTHORIZED_LOGIN_MESSAGE)
        return
      }
      toggleNotification()
      updateNotificationMessage(ERROR_CREATE_USER_TITLE)
      console.error(ERROR_CREATE_USER_TITLE)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, messageError])

  return (
    <Card className="max-w-sm">
      <h2 className="text-2xl text-gray-900 dark:text-white">
        Ingrese sus credenciales para entrar a su cuenta.
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
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

        <div>
          <div className="mb-2 block">
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <TextInput
            id="password"
            type="password"
            {...register("password")}
          />
          { errors.password?.message && (
            <ErrorMessage>{errors.password?.message}</ErrorMessage>
          )}
        </div>
        <Link className="underline" href={FORGOT_PASSWORD_ROUTE}>¿Olvidaste tu contraseña?</Link>
        <LinkButton type="secondary" href={REGISTER_ROUTE} >
          Registrarse
        </LinkButton>
        <Button
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess}
          type="submit">
          { (isIdle || isError) && 'Iniciar sesión'}
          { isPending && (<Spinner aria-label="loading login kraft envios" />) }
          { isSuccess && (<CheckIcon />)}
        </Button>
      </form>
    </Card>
  )
}