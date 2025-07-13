"use client"

import { Card, Label, TextInput } from "flowbite-react"

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
          </form>
        </Card>
      </main>
    </div>
  )
}