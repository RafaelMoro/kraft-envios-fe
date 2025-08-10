import { useState } from "react"

import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"
import { Quote, QuoteUI } from "@/shared/types/quotes.types"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { QuoteCard } from "@/features/Quotes/QuoteCard"

interface QuotesProps {
  userInfo: LoginData | null
}

export const QuotesSubscreen = ({ userInfo }: QuotesProps) => {
  const [quotes, setQuotes] = useState<QuoteUI[]>([])
  const updateQuotes = (quotesGotten: Quote[]) => {
    const quotesFormatted: QuoteUI[] = quotesGotten.map((item) => ({
      ...item,
      amountFormatted: formatNumberToCurrency(item.total)
    }))
    setQuotes(quotesFormatted)
  }

  const mockQuote: QuoteUI = {
    id: '2c72cac0-0252-41bb-820e-b31d72c9daa2',
    service: 'DHL Economy Select RECOMENDAMOS KILOS CHICOS',
    total: 204.05,
    amountFormatted: '$204.05',
    source: 'GE'
  }

  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para obtener una cotización</p>
      <QuoteForm />
      <section>
        <h2 className="text-2xl font-bold">Cotizaciones</h2>
        <p className="text-gray-600">Aquí se mostrarán las cotizaciones generadas.</p>
        <QuoteCard quote={mockQuote} />
      </section>
    </main>
  )
}