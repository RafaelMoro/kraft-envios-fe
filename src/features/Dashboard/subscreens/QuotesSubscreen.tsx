import { useState } from "react"
import { Button } from "flowbite-react"

import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"
import { Quote, QuoteCourier, QuoteSource, QuoteTypeService, QuoteUI } from "@/shared/types/quotes.types"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { QuoteCard } from "@/features/Quotes/QuoteCard"
import { filterQuotesByCourierUtil, filterQuotesBySourceUtil, filterQuotesByTimeTypeUtil, formatQuoteServiceName, getQuoteImg } from "@/shared/utils/quotes.utils"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { CourierFilter } from "@/features/Quotes/CourierFilter"
import { SourceFilterDropdown } from "@/features/Quotes/SourceFilterDropdown"
import { TimeFilterDropdown } from "@/features/Quotes/TimeFilterDropdown"

interface QuotesProps {
  userInfo: LoginData | null
}

export const QuotesSubscreen = ({ userInfo }: QuotesProps) => {
  const { isMobile } = useMediaQuery()
  const [allQuotes, setAllQuotes] = useState<QuoteUI[]>([])
  const [filteredQuotes, setAllFilteredQuotes] = useState<QuoteUI[]>([])
  // Track currently selected filters so they can be applied cumulatively
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>(null)
  const [selectedSource, setSelectedSource] = useState<QuoteSource | null>(null)
  const [selectedTimeType, setSelectedTimeType] = useState<QuoteTypeService | null>(null)

  const updateAllQuotes = (quotesGotten: Quote[]) => {
    const quotesFormatted: QuoteUI[] = quotesGotten.map((item) => ({
      ...item,
      service: formatQuoteServiceName(item.service),
      logoSrc: getQuoteImg(item.courier, isMobile),
      amountFormatted: formatNumberToCurrency(item.total)
    }))
    setAllQuotes(quotesFormatted)
    setAllFilteredQuotes(quotesFormatted)
  }

  const resetFiltersQuotes = () => {
    setSelectedCourier(null)
    setSelectedSource(null)
    setSelectedTimeType(null)
    setAllFilteredQuotes(allQuotes)
  }

  // Apply all currently selected filters to `allQuotes` in sequence.
  const applyActiveFilters = (opts?: {
    courier?: QuoteCourier | null
    source?: QuoteSource | null
    timeType?: QuoteTypeService | null
  }): QuoteUI[] => {
    const courier = opts?.courier !== undefined ? opts.courier : selectedCourier
    const source = opts?.source !== undefined ? opts.source : selectedSource
    const timeType = opts?.timeType !== undefined ? opts.timeType : selectedTimeType

    let result = [...allQuotes]

    if (courier) {
      result = filterQuotesByCourierUtil(result, courier)
    }
    if (source) {
      result = filterQuotesBySourceUtil(result, source)
    }
    if (timeType) {
      result = filterQuotesByTimeTypeUtil(result, timeType)
    }

    return result
  }

  const filterQuotesByCourier = (newCourier: QuoteCourier) => {
    setSelectedCourier(newCourier)
    const filtered = applyActiveFilters({ courier: newCourier })
    setAllFilteredQuotes(filtered)
  }

  const filterQuotesBySource = (newSource: QuoteSource) => {
    setSelectedSource(newSource)
    const filtered = applyActiveFilters({ source: newSource })
    setAllFilteredQuotes(filtered)
  }

  const filterQuotesByTimeType = (newTimeType: QuoteTypeService) => {
    setSelectedTimeType(newTimeType)
    const filtered = applyActiveFilters({ timeType: newTimeType })
    setAllFilteredQuotes(filtered)
  }

  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para obtener una cotización</p>
      <QuoteForm updateQuotes={updateAllQuotes} />
      { allQuotes.length > 0 && (
        <section className="flex flex-col gap-4 align-center justify-center mt-7">
          <h2 className="text-2xl font-bold text-center">Cotizaciones</h2>
          <p className="text-gray-600 text-center mb-5">Aquí se mostrarán las cotizaciones generadas.</p>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p>Filtrar por:</p>
            <Button color="light" onClick={resetFiltersQuotes}>Limpiar filtros</Button>
            <CourierFilter selectedCourier={selectedCourier} setSelectedCourier={setSelectedCourier} filterQuotesByCourier={filterQuotesByCourier} resetFiltersQuotes={resetFiltersQuotes} />
            <SourceFilterDropdown selectedSource={selectedSource} setSelectedSource={setSelectedSource} filterQuotesBySource={filterQuotesBySource} resetFiltersQuotes={resetFiltersQuotes} />
            <TimeFilterDropdown selectedType={selectedTimeType} setSelectedType={setSelectedTimeType} filterQuotesByType={filterQuotesByTimeType} resetFiltersQuotes={resetFiltersQuotes} />
          </div>
            { filteredQuotes.length === 0 && (
              <div className="min-h-[500px]">
                <p className="text-center text-lg font-semibold">No hay cotizaciones disponibles de acuerdo a tu criterio de búsqueda.</p>
              </div>
            )}
            { filteredQuotes.length > 0 && (
              <div className="min-h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  { filteredQuotes.map((qt) => (
                    <QuoteCard key={`${qt.id}-${qt.service}`} quote={qt} />
                  )) }
                </div>
              </div>
            )}
        </section>
      )}
    </main>
  )
}