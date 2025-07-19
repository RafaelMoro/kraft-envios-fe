import { FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/shared/constants/global.constants";
import { LinkButton } from "@/shared/ui/atoms/LinkButton";
import { Button, Card, Label, TextInput } from "flowbite-react";
import Link from "next/link";

export const LoadingLoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
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
                className="animate-pulse"
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                className="animate-pulse"
              />
            </div>
            <Link className="underline" href={FORGOT_PASSWORD_ROUTE}>¿Olvidaste tu contraseña?</Link>
            <LinkButton type="secondary" href={REGISTER_ROUTE} >
              Registrarse
            </LinkButton>
            <Button
              disabled
              className="hover:cursor-pointer"
              type="submit">
              Iniciar sesión
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}