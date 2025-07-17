"use client"
import Link from "next/link"
import { Button, Card, Label, TextInput } from "flowbite-react"

import { FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/shared/constants/global.constants"
import { LinkButton } from "@/shared/ui/atoms/LinkButton"

export const LoginCard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">Bienvenido de vuelta</h1>
        <Card className="max-w-sm">
          <h2 className="text-2xl text-gray-900 dark:text-white">
            Ingrese sus credenciales para entrar a su cuenta.
          </h2>
          <form className="flex max-w-md flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email">Correo Electrónico</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="correo-electrónico@gmail.com"
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <TextInput id="password" type="password" />
            </div>
            <Link className="underline" href={FORGOT_PASSWORD_ROUTE}>¿Olvidaste tu contraseña?</Link>
            <LinkButton type="secondary" href={REGISTER_ROUTE} >
              Registrarse
            </LinkButton>
            <Button
              className="hover:cursor-pointer"
              // disabled={isPending || isSuccess}
              type="submit">
                Iniciar sesión
              {/* { (isIdle || isError) && 'Iniciar sesión'}
              { isPending && (<Spinner aria-label="loading login budget master" />) }
              { isSuccess && (<CheckIcon />)} */}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}