import { Stepper } from "@/shared/ui/atoms/Stepper"
import { PersonalInformation } from "./PersonalInformation"

export const Register = () => {
  const steps = new Set(["Información Personal", "Usuario y contraseña", "Resultado"])
  const currentStep = 1
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Stepper steps={steps} currentStep={currentStep} />
      <div className="flex-1 flex justify-center items-center">
        <PersonalInformation />
      </div>
    </div>
  )
}