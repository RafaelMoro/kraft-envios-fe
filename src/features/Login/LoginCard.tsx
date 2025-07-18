"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button, Card, CheckIcon, Label, Spinner, TextInput, Toast, ToastToggle } from "flowbite-react"
import { HiX } from "react-icons/hi"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

import { DASHBOARD_ROUTE, FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/shared/constants/global.constants"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { LoginData, LoginError, LoginPayload, LoginSchema } from "@/shared/types/login.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { LoginMutationCb } from "@/shared/utils/login.utils"
import { ERROR_CREATE_USER_TITLE, ERROR_UNAUTHORIZED_LOGIN, ERROR_UNAUTHORIZED_LOGIN_MESSAGE } from "@/shared/constants/login.constants"

export const LoginCard = () => {
  const router = useRouter()
  const [openNotification, setOpenNotification] = useState<boolean>(false)
  const [notificationMessage, setNotificationMessage] = useState<string>("")

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
        setOpenNotification(true)
        setNotificationMessage(ERROR_UNAUTHORIZED_LOGIN_MESSAGE)
        return
      }
      setOpenNotification(true)
      setNotificationMessage(ERROR_CREATE_USER_TITLE)
      console.error(ERROR_CREATE_USER_TITLE)
    }
  }, [isError, messageError])

  return (
    <div className="min-h-screen flex flex-col relative">
        { openNotification && (
          <div className="w-full flex justify-center absolute top-0">
            <Toast>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiX className="h-5 w-5" />
              </div>
              <p className="ml-3 text-sm font-normal">{notificationMessage}</p>
              <ToastToggle onDismiss={() => setOpenNotification(false)} />
            </Toast>
          </div>
        ) }
        <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
          <h1 className="text-black dark:text-white text-4xl text-center font-bold">Bienvenido de vuelta</h1>
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
        </main>
      </div>
  )
}