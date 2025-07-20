"use client"
import { useRef } from "react"
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { PersonalInformation } from "./PersonalInformation"
import { useSteps } from "@/shared/hooks/useSteps"
import { CompanyDetailsForm, FormDataRegister, PersonalInformationForm } from "@/shared/types/login.types"
import { CompanyDetails } from "./CompanyDetails"

export const Register = () => {
  const { step, goNext, goPrev } = useSteps({ firstStep: 1 })
  const steps = new Set(["Información Personal", "Usuario y contraseña", "Resultado"])

  const formData = useRef<FormDataRegister>({
    personalInformation: {
      firstName: "",
      lastName: ""
    },
    companyDetails: {
      companyName: "",
      address: "",
      postalCode: ""
    }
  })
  const updatePersonalInformation = (data: PersonalInformationForm) => {
    formData.current.personalInformation = data
  }
  const updateCompanyDetails = (data: CompanyDetailsForm) => {
    formData.current.companyDetails = data
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="pt-7">
        <Stepper steps={steps} currentStep={step} />
      </div>
      <div className="flex-1 flex justify-center items-center">
        { step === 1 && (<PersonalInformation goNext={goNext} updatePersonalInformation={updatePersonalInformation} />) }
        { step === 2 && (<CompanyDetails goPrev={goPrev} updateCompanyDetails={updateCompanyDetails} goNext={goNext} />) }
      </div>
    </div>
  )
}