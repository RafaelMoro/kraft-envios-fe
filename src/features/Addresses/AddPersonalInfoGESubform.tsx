import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { PersonalDataGEFormValues, PersonalInformationGEFormSchema } from "@/shared/types/guides.types"
import { PersonalInfoAddressGESubform } from "../Guides/GE/PersonalInfoAddressGESubform"

export const AddPersonalInfoGESubform = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataGEFormValues>({
    resolver: yupResolver(PersonalInformationGEFormSchema)
  })

  const onSubmit: SubmitHandler<PersonalDataGEFormValues> = (data, event) => {
    event?.preventDefault()
    event?.stopPropagation()

    // Convert payload to GE
    // Fire mutation to create address in GE
    // Fire mutation to create address in our API
  }

  return (
    <form
      className="p-4 overflow-y-auto flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-xl">Datos personales</h4>
      <PersonalInfoAddressGESubform<PersonalDataGEFormValues>
        errors={errors}
        register={register}
      />
    </form>
  )
}