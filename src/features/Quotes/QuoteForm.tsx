"use client"

import { Button, Label, TextInput } from "flowbite-react"

export const QuoteForm = () => {
  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-3 grid-rows-2 gap-4"
    >
      <div>
        <div className="mb-2 block">
          <Label htmlFor="originPostalCode">Código Postal de Origen</Label>
        </div>
        <TextInput
          id="originPostalCode"
          type="text"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="destinationPostalCode">Código Postal de Destino</Label>
        </div>
        <TextInput
          id="destinationPostalCode"
          type="text"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="weight">Peso</Label>
        </div>
        <TextInput
          id="weight"
          type="number"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="length">Largo</Label>
        </div>
        <TextInput
          id="length"
          type="number"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="height">Altura</Label>
        </div>
        <TextInput
          id="height"
          type="number"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="width">Ancho</Label>
        </div>
        <TextInput
          id="width"
          type="number"
          // {...register("email")}
        />
        {/* { errors.email?.message && (
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        )} */}
      </div>
      <Button
        className="hover:cursor-pointer"
        // disabled={isPending || isSuccess}
        type="submit">
          Cotizar
        {/* { (isIdle || isError) && 'Iniciar sesión'}
        { isPending && (<Spinner aria-label="loading login kraft envios" />) }
        { isSuccess && (<CheckIcon />)} */}
      </Button>
    </form>
  )
}