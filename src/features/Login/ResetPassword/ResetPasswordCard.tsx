"use client"
import { Button, Card, CheckIcon, Label, Spinner, TextInput } from "flowbite-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { SubmitHandler, useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"

import { LOGIN_ROUTE } from "@/shared/constants/global.constants"
import { ResetPasswordData, ResetPasswordError, ResetPasswordFormData, ResetPasswordPayload, ResetPasswordSchema } from "@/shared/types/login.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"
import { resetPasswordCb } from "@/shared/utils/login.utils"

interface ResetPasswordCardProps{
  slug: string
}

export const ResetPasswordCard = ({ slug }: ResetPasswordCardProps) => {
  console.log('slug', slug)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema)
  })

  const { mutate: resetPwdMutation, isError, isPending, isSuccess, isIdle } = useMutation<ResetPasswordData, ResetPasswordError, ResetPasswordPayload>({
    mutationFn: (data) => resetPasswordCb(data, slug),
    onError: () => {
      // toggleMessageCardState("error")
    },
    onSuccess: () => {
      // toggleMessageCardState("success")
    }
  })

  const onSubmit: SubmitHandler<ResetPasswordFormData> = (data) => {
    const payload: ResetPasswordPayload = {
      password: data.password
    }
    resetPwdMutation(payload)
  }


  return (
    <Card className="max-w-[400px]">
      <p className="text-xl text-black dark:text-white mb-2">
        Ingresa y confirma tu nueva contraseña para recuperar el acceso.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
        <LinkButton className="mt-4" type="secondary" href={LOGIN_ROUTE} >Volver al inicio</LinkButton>
        <Button
          className="hover:cursor-pointer"
          disabled={isPending || isSuccess}
          type="submit"
        >
          { (isIdle || isError) && 'Reestablecer contraseña'}
          { isPending && (<Spinner aria-label="loading reset password budget master" />) }
          { isSuccess && (<CheckIcon />)}
        </Button>
      </form>
    </Card>
  )
}