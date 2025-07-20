"use client"
import { useRef } from "react"

import { Stepper } from "@/shared/ui/atoms/Stepper"
import { PersonalInformation } from "./PersonalInformation"
import { useSteps } from "@/shared/hooks/useSteps"
import { CompanyDetailsForm, CreateUserData, CreateUserError, CreateUserPayload, FormDataRegister, PersonalInformationForm, UserPasswordForm } from "@/shared/types/login.types"
import { CompanyDetails } from "./CompanyDetails"
import { UserRegistration } from "./UserRegistration"
import { ResultCard } from "./ResultCard"
import { ERROR_CREATE_USER_MESSAGE, ERROR_CREATE_USER_TITLE, ERROR_EMAIL_IN_USE, SUCCESS_CREATE_USER_MESSAGE, SUCCESS_CREATE_USER_TITLE } from "@/shared/constants/login.constants"
import { useMutation } from "@tanstack/react-query"
import { AxiosResponse } from "axios"
import { createUserCb } from "@/shared/utils/login.utils"
import { GeneralError } from "@/shared/types/global.types"

export const Register = () => {
  const { step, goNext, goPrev, resetSteps } = useSteps({ firstStep: 1 })
  const steps = new Set(["Información Personal", "Datos de su compañia", "Usuario y contraseña", "Resultado"])

  const {
    mutate: createUserMutation,
    isError,
    isPending,
    isSuccess,
    error
  } = useMutation<CreateUserData, AxiosResponse<CreateUserError>, CreateUserPayload>({
    mutationFn: createUserCb,
    onError: () => {
      goNext()
    },
    onSuccess: () => {
      goNext()
    }
  })
  const currentMessageError = (error as unknown as GeneralError)?.response?.data?.error?.message
  const messageError = currentMessageError === ERROR_EMAIL_IN_USE ? 'Intente con otro correo electrónico' : ERROR_CREATE_USER_MESSAGE

  const formData = useRef<FormDataRegister>({
    personalInformation: {
      name: "",
      lastName: "",
      phone: ""
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
    const payload: CreateUserPayload = {
      name: formData.current.personalInformation.name,
      lastName: formData.current.personalInformation.lastName,
      email: formData.current.userPassword.email,
      password: formData.current.userPassword.password,
      phone: formData.current.personalInformation.phone,
      postalCode: formData.current.companyDetails.postalCode,
      companyName: formData.current.companyDetails.companyName ?? '',
      secondPhone: formData.current.companyDetails.secondPhoneNumber ?? '',
      address: formData.current.companyDetails.address ?? '',
      role: []
    }
      createUserMutation(payload)
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
            isLoading={isPending}
            goPrev={goPrev}
            submitForm={handleSubmit}
            updateUserPasswordInfo={updateUserPassword}
          />
        )}
        { step === 4 && isError && (
          <ResultCard
            isError={isError}
            title={ERROR_CREATE_USER_TITLE}
            message={messageError}
            resetStep={resetSteps}
          />
        )}
        { step === 4 && isSuccess && (
          <ResultCard
            isError={isError}
            title={SUCCESS_CREATE_USER_TITLE}
            message={SUCCESS_CREATE_USER_MESSAGE}
            resetStep={resetSteps}
          />
        )}
      </div>
    </div>
  )
}