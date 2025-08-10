import { LoginData } from "@/shared/types/login.types"

interface QuotesProps {
  userInfo: LoginData | null
}

export const Quotes = ({ userInfo }: QuotesProps) => {
  return (
    <main className='p-4'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
    </main>
  )
}