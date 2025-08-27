import { Button, Label, TextInput } from "flowbite-react"

export const ProfitMarginForm = () => {
  return (
     <form
      // onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center gap-16"
    >
      <section className="flex flex-col gap-5">
        <h4 className="text-xl font-semibold mb-4">Domicilio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="originPostalCode">Código Postal de Origen</Label>
            </div>
            <TextInput
              id="originPostalCode"
              type="text"
              inputMode="numeric"
              // {...register("originPostalCode")}
            />
            {/* { errors.originPostalCode?.message && (
              <ErrorMessage>{errors.originPostalCode?.message}</ErrorMessage>
            )} */}
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="destinationPostalCode">Código Postal de Destino</Label>
            </div>
            <TextInput
              id="destinationPostalCode"
              type="text"
              inputMode="numeric"
              // {...register("destinationPostalCode")}
            />
            {/* { errors.destinationPostalCode?.message && (
              <ErrorMessage>{errors.destinationPostalCode?.message}</ErrorMessage>
            )} */}
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <Button
          className="hover:cursor-pointer"
          // disabled={isPending}
          type="submit">
          {/* { isPending ? (<Spinner aria-label="loading get quotes kraft envios" />) : 'Cotizar' } */}
          Actualizar margen
        </Button>
      </div>
    </form>
  )
}