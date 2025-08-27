import { ProfitMarginForm } from "@/features/ProfitMargin/ProfitMarginForm"
import { ShowProfitMargin } from "@/features/ProfitMargin/ShowProfitMargin"
import { LoginData } from "@/shared/types/login.types"

interface MarginProgitSubscreenProps {
  userInfo: LoginData | null
}

export const MarginProfitSubscreen = ({ userInfo }: MarginProgitSubscreenProps) => {
  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para actualizar el margen de ganancia</p>
      <ShowProfitMargin />
      <ProfitMarginForm />
    </main>
  )
}