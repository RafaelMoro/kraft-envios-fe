import { useState } from "react"

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

  // TODO: Delete the mocks
  const mockQuotes: QuoteUI[] = [
    {
      id: "8812f041-a4dd-4a96-8195-10941e2779ce",
      service: "Estafeta sin recoleccion mejor precio 2025",
      courier: "Estafeta",
      typeService: "nextDay",
      total: 169,
      amountFormatted: "$169",
      source: "GE",
      logoSrc: getQuoteImg("Estafeta", isMobile),
    },
    {
      id: "8812f041-a4dd-4a96-8195-10941e2779c4",
      service: "Estafeta Pakke",
      courier: "Estafeta",
      typeService: "nextDay",
      total: 201,
      amountFormatted: "$201",
      source: "Pkk",
      logoSrc: getQuoteImg("Estafeta", isMobile),
    },
    {
      id: "6e40eaa0-102b-4ec5-9d6e-e8991b30cf75",
      service: "DHL Express Select RECOMENDAMOS KILOS CHICOS",
      total: 198.62,
      courier: "DHL",
      typeService: "nextDay",
      amountFormatted: "$198.62",
      source: "GE",
      logoSrc: getQuoteImg("DHL", isMobile),
    },
    {
      id: "0807501a-ebf6-4156-8b22-2acd096d5731",
      service: "UPS premium UPS",
      total: 166.08,
      courier: "UPS",
      typeService: "nextDay",
      amountFormatted: "$166.08",
      source: "GE",
      logoSrc: getQuoteImg("UPS", isMobile),
    },
    {
      id: "3a9ef7f2-0f4c-4ca9-9ee2-bace896afaaf",
      service: "PAQUETEXPRES NACIONAL ZONA1",
      courier: "Paquetexpress",
      typeService: "standard",
      total: 244.09,
      amountFormatted: "$244.09",
      source: "GE",
      logoSrc: getQuoteImg("Paquetexpress", isMobile),
    },
    {
      id: "9",
      service: "99Min",
      courier: "NextDay",
      typeService: "standard",
      total: 166.75,
      amountFormatted: "$166.75",
      source: "TONE",
      logoSrc: getQuoteImg("NextDay", isMobile),
    },
    {
      id: "FDX-FedEx-FEDEX_STANDARD_OVERNIGHT",
      service: "FedEx Standard Overnight",
      courier: "Fedex",
      typeService: "nextDay",
      total: 214.7,
      amountFormatted: "$214.70",
      source: "Pkk",
      logoSrc: getQuoteImg("Fedex", isMobile),
    },
  ];

  // TODO: Change this for empty array at the end
  const [allQuotes, setAllQuotes] = useState<QuoteUI[]>(mockQuotes)
  // TODO: Change this for empty array at the end
  const [filteredQuotes, setAllFilteredQuotes] = useState<QuoteUI[]>(mockQuotes)
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
    // Clear selected filters and reset the filtered list
    setSelectedCourier(null)
    setSelectedSource(null)
    setSelectedTimeType(null)
    // TODO: Change this for the commented line
    // use `allQuotes` when quotes are coming from the API
    setAllFilteredQuotes(allQuotes)
    // setAllFilteredQuotes(mockQuotes)
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
          <div className="flex gap-3">
            <p>Filtrar por:</p>
            <CourierFilter selectedCourier={selectedCourier} setSelectedCourier={setSelectedCourier} filterQuotesByCourier={filterQuotesByCourier} resetFiltersQuotes={resetFiltersQuotes} />
            <SourceFilterDropdown filterQuotesBySource={filterQuotesBySource} resetFiltersQuotes={resetFiltersQuotes} />
            <TimeFilterDropdown filterQuotesByType={filterQuotesByTimeType} resetFiltersQuotes={resetFiltersQuotes} />
          </div>
            { filteredQuotes.length === 0 && (
              <p className="text-center text-lg font-semibold">No hay cotizaciones disponibles de acuerdo a tu criterio de búsqueda.</p>
            )}
            { filteredQuotes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { filteredQuotes.map((qt) => (
                  <QuoteCard key={`${qt.id}-${qt.service}`} quote={qt} />
                )) }
              </div>
            )}
        </section>
      )}
    </main>
  )
}