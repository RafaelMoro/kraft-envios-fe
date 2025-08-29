import { useState } from "react"

import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"
import { Quote, QuoteUI } from "@/shared/types/quotes.types"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { QuoteCard } from "@/features/Quotes/QuoteCard"
import { formatQuoteServiceName, getQuoteImg } from "@/shared/utils/quotes.utils"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

interface QuotesProps {
  userInfo: LoginData | null
}

export const QuotesSubscreen = ({ userInfo }: QuotesProps) => {
  const { isMobile } = useMediaQuery()
  const [quotes, setQuotes] = useState<QuoteUI[]>([])
  const updateQuotes = (quotesGotten: Quote[]) => {
    const quotesFormatted: QuoteUI[] = quotesGotten.map((item) => ({
      ...item,
      service: formatQuoteServiceName(item.service),
      logoSrc: getQuoteImg(item.courier, isMobile),
      amountFormatted: formatNumberToCurrency(item.total)
    }))
    setQuotes(quotesFormatted)
  }

  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para obtener una cotización</p>
      <QuoteForm updateQuotes={updateQuotes} />
      { quotes.length > 0 && (
        <section className="flex flex-col gap-4 align-center justify-center mt-7">
          <h2 className="text-2xl font-bold text-center">Cotizaciones</h2>
          <p className="text-gray-600 text-center mb-5">Aquí se mostrarán las cotizaciones generadas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              { quotes.map((qt) => (
                <QuoteCard key={`${qt.id}-${qt.service}`} quote={qt} />
              )) }
            </div>
        </section>
      )}
    </main>
  )
}