"use client"
import { Stepper } from "@/shared/ui/atoms/Stepper"
import { PersonalInformation } from "./PersonalInformation"
import { useSteps } from "@/shared/hooks/useSteps"

export const Register = () => {
  const { step, goNext, goPrev } = useSteps({ firstStep: 1 })
  const steps = new Set(["Información Personal", "Usuario y contraseña", "Resultado"])

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="pt-7">
        <Stepper steps={steps} currentStep={step} />
      </div>
      <div className="flex-1 flex justify-center items-center">
        { step === 1 && (<PersonalInformation />) }
      </div>
    </div>
  )
}