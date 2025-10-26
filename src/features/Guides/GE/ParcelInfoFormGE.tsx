import { Label, TextInput } from "flowbite-react";
import { ReactNode } from "react";

interface ParcelInfoFormGEProps {
  isMobileTablet: boolean;
  children: ReactNode;
}

export const ParcelInfoFormGE = ({ isMobileTablet, children }: ParcelInfoFormGEProps) => {
  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
    >
      { isMobileTablet && (<h5 className="text-xl font-bold text-center mb-5">Información del paquete</h5>)}
      <section className="flex flex-col gap-4">
        { children }
        <div>
          <div className="mb-2 block">
            <Label htmlFor="content">Contenido del paquete</Label>
          </div>
          <TextInput 
            data-testid="content"
            // defaultValue={parcelInfo.content}
            id="content"
            type="text"
            // {...register("content")}
          />
          {/* { errors?.content?.message && (
            <ErrorMessage>{errors.content?.message}</ErrorMessage>
          )} */}
        </div>
      </section>
    </form>
  )
}