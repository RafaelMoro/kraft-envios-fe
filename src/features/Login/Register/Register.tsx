"use client"
import { useRef } from "react"
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { PersonalInformation } from "./PersonalInformation"
import { useSteps } from "@/shared/hooks/useSteps"
import { CompanyDetailsForm, FormDataRegister, PersonalInformationForm, UserPasswordForm } from "@/shared/types/login.types"
import { CompanyDetails } from "./CompanyDetails"
import { UserRegistration } from "./UserRegistration"

export const Register = () => {
  const { step, goNext, goPrev } = useSteps({ firstStep: 1 })
  const steps = new Set(["Información Personal", "Datos de su compañia", "Usuario y contraseña", "Resultado"])

  const formData = useRef<FormDataRegister>({
    personalInformation: {
      firstName: "",
      lastName: ""
    },
    companyDetails: {
      companyName: "",
      address: "",
      postalCode: ""
    },
    userPassword: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  })
  const updatePersonalInformation = (data: PersonalInformationForm) => {
    formData.current.personalInformation = data
  }
  const updateCompanyDetails = (data: CompanyDetailsForm) => {
    formData.current.companyDetails = data
  }
  const updateUserPassword = (data: UserPasswordForm) => {
    formData.current.userPassword = data
  }

  const handleSubmit = async () => {
    // try {
    //   const payload: CreateUserPayload = {
    //     firstName: formData.current.personalInformation.firstName,
    //     middleName: formData.current.personalInformation.middleName ?? '',
    //     lastName: formData.current.personalInformation.lastName,
    //     email: formData.current.userPasswordInfo.email,
    //     password: formData.current.userPasswordInfo.password,
    //   }
    //   createUserMutation(payload)
    // } catch (error) {
    //   console.log('error when registering user', error)
    // }
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="pt-7">
        <Stepper steps={steps} currentStep={step} />
      </div>
      <div className="flex-1 flex justify-center items-center">
        { step === 1 && (
          <PersonalInformation
            personalInformation={formData.current.personalInformation}
            goNext={goNext}
            updatePersonalInformation={updatePersonalInformation}
          />
        )}
        { step === 2 && (
          <CompanyDetails
            companyDetails={formData.current.companyDetails}
            goPrev={goPrev}
            updateCompanyDetails={updateCompanyDetails}
            goNext={goNext}
          />
        )}
        { step === 3 && (
          <UserRegistration
            goPrev={goPrev}
            submitForm={handleSubmit}
            updateUserPasswordInfo={updateUserPassword}
          />
        )}
      </div>
    </div>
  )
}