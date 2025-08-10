import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"

interface QuotesProps {
  userInfo: LoginData | null
}

export const Quotes = ({ userInfo }: QuotesProps) => {
  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para obtener una cotización</p>
      <QuoteForm />
    </main>
  )
}