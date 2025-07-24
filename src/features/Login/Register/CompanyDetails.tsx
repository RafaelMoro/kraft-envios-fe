import { CompanyDetailsForm, CompanyDetailsSchema } from "@/shared/types/login.types";
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, Label, TextInput } from "flowbite-react"
import { SubmitHandler, useForm } from "react-hook-form";

interface CompanyDetailsProps {
  companyDetails: CompanyDetailsForm
  goPrev: () => void;
  goNext: () => void
  updateCompanyDetails: (data: CompanyDetailsForm) => void
}

export const CompanyDetails = ({ companyDetails, goPrev, goNext, updateCompanyDetails }: CompanyDetailsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyDetailsForm>({
    resolver: yupResolver(CompanyDetailsSchema)
  })

  const onSubmit: SubmitHandler<CompanyDetailsForm> = (data) => {
    updateCompanyDetails(data)
    goNext()
  }

  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Crear cuenta.
      </h5>
      <p className="text-xl text-black dark:text-white">Cuéntanos el nombre de tu compañía, su dirección y el código postal para empezar a trabajar juntos.</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-md flex-col gap-4"
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="companyName">Nombre de la compañia (Opcional)</Label>
          </div>
          <TextInput
            data-testid="companyName"
            defaultValue={companyDetails.companyName ?? ''}
            id="companyName"
            type="text"
            {...register("companyName")}
          />
          { errors?.companyName?.message && (
            <ErrorMessage>{errors.companyName?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="address">Dirección (Opcional)</Label>
          </div>
          <TextInput
            id="address"
            defaultValue={companyDetails.address ?? ''}
            type="text"
            {...register("address")}
          />
          { errors?.address?.message && (
            <ErrorMessage>{errors?.address?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="postalCode">Código postal</Label>
          </div>
          <TextInput
            data-testid="postalCode"
            id="postalCode"
            type="text"
            inputMode="numeric"
            defaultValue={companyDetails.postalCode}
            {...register("postalCode")}
          />
          { errors?.postalCode?.message && (
            <ErrorMessage>{errors?.postalCode?.message}</ErrorMessage>
          )}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="secondPhoneNumber">Segundo número telefónico (Opcional)</Label>
          </div>
          <TextInput
            data-testid="secondPhoneNumber"
            id="secondPhoneNumber"
            type="text"
            inputMode="numeric"
            defaultValue={companyDetails.secondPhoneNumber ?? ''}
            {...register("secondPhoneNumber")}
          />
          { errors?.secondPhoneNumber?.message && (
            <ErrorMessage>{errors?.secondPhoneNumber?.message}</ErrorMessage>
          )}
        </div>
        <Button className="hover:cursor-pointer" outline onClick={goPrev}>Regresar</Button>
        <Button data-testid="company-details-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </form>
    </Card>
  )
}