import { useRef, useState } from "react"
import { Button } from "flowbite-react"
import { RiFileCopyLine, RiStickyNoteAddLine } from "@remixicon/react"

import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"
import { Quote, QuoteUI } from "@/shared/types/quotes.types"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { QuoteCard } from "@/features/Quotes/QuoteCard"
import { formatQuoteServiceName, getQuoteImg } from "@/shared/utils/quotes.utils"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { CourierFilter } from "@/features/Quotes/CourierFilter"
import { SourceFilterDropdown } from "@/features/Quotes/SourceFilterDropdown"
import { TimeFilterDropdown } from "@/features/Quotes/TimeFilterDropdown"
import { useQuoteFilters } from "@/shared/hooks/useQuotesFilters"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { CopyInfoQuotesModal } from "@/features/Quotes/CopyInfoQuotesModal"

interface QuotesProps {
  userInfo: LoginData | null
}

export const QuotesSubscreen = ({ userInfo }: QuotesProps) => {
  const { isMobile } = useMediaQuery()
  const [allQuotes, setAllQuotes] = useState<QuoteUI[]>([])
  const [filteredQuotes, setAllFilteredQuotes] = useState<QuoteUI[]>([])

  // State used for the action bar
  const [selectedQuotes, setSelectedQuotes] = useState<QuoteUI[]>([])
  const [errorActionBar, setErrorActionBar] = useState<string | null>(null)
  const [openCopyModal, setOpenCopyModal] = useState<boolean>(false)
  const toggleCopyModal = () => setOpenCopyModal((prev) => !prev)
  const addSelectedQuote = (quote: QuoteUI) => {
    if (errorActionBar) setErrorActionBar(null)

    const newSelectedQuote = [...selectedQuotes, quote]
    setSelectedQuotes(newSelectedQuote)
  }
  const removeSelectedQuote = (quoteId: string) => {
    if (errorActionBar) setErrorActionBar(null)

    const filtered = selectedQuotes.filter((q) => q.id !== quoteId)
    setSelectedQuotes(filtered)
  }

  const handleClickCopyInfo = () => {
    if (selectedQuotes.length === 0) {
      setErrorActionBar('Debes seleccionar al menos una cotización para copiar su información.')
      return
    }
    toggleCopyModal()
  }

  const handleClickCreateGuide = () => {
    if (selectedQuotes.length > 1) {
      setErrorActionBar('Solo puede seleccionar una sola cotización para crear una guía.')
      // TODO: Add return
    }
  }

  const {
    selectedCourier,
    selectedSource,
    selectedTimeType,
    filterQuotesByCourier,
    filterQuotesBySource,
    filterQuotesByTimeType,
    setSelectedCourier,
    setSelectedSource,
    setSelectedTimeType
  } = useQuoteFilters({ allQuotes, setAllFilteredQuotes })

  // Reference to the quotes section for scrolling into view
  const quotesSectionRef = useRef(null)

  const updateAllQuotes = (quotesGotten: Quote[]) => {
    const quotesFormatted: QuoteUI[] = quotesGotten.map((item) => ({
      ...item,
      service: formatQuoteServiceName(item.service),
      logoSrc: getQuoteImg({ courier: item.courier, isMobile }),
      amountFormatted: formatNumberToCurrency(item.total)
    }))
    setAllQuotes(quotesFormatted)
    setAllFilteredQuotes(quotesFormatted)
    setTimeout(() => {
      scrollToQuotesSection()
    }, 500)
  }

  const resetFiltersQuotes = () => {
    setSelectedCourier(null)
    setSelectedSource(null)
    setSelectedTimeType(null)
    setAllFilteredQuotes(allQuotes)
  }

  /**
   * Scroll the quotes section into view when the ref exists.
   * Safe-guards against missing ref or missing scrollIntoView API.
   */
  const scrollToQuotesSection = () => {
    const el = quotesSectionRef?.current as HTMLElement | null
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className='w-full p-4 flex flex-col gap-5 align-center'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <p className="text-center text-xl mb-5">Ingrese los siguientes datos para obtener una cotización</p>
      <QuoteForm updateQuotes={updateAllQuotes} />
      { allQuotes.length > 0 && (
        <section ref={quotesSectionRef} className="flex flex-col gap-4 align-center justify-center mt-7">
          <h2 className="text-2xl font-bold text-center">Cotizaciones</h2>
          <p className="text-gray-600 text-center mb-5">Aquí se mostrarán las cotizaciones generadas.</p>
          <div data-testid="quotes-action-bar" className="w-full flex justify-end gap-2">
            <Button color="alternative" className="inline-flex gap-2" onClick={handleClickCopyInfo}>
              <RiFileCopyLine size={20} />
              Copiar información
            </Button>
            <Button className="inline-flex gap-2" onClick={handleClickCreateGuide}>
              <RiStickyNoteAddLine size={20} />
              Crear guía
            </Button>
          </div>
          { errorActionBar && (
            <div className="flex justify-end">
              <ErrorMessage>{errorActionBar}</ErrorMessage>
            </div>
          )}
          <div data-testid="quotes-filters" className="flex flex-col md:flex-row items-center gap-3 mb-5">
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
                    <QuoteCard
                      key={`${qt.id}-${qt.service}`}
                      quote={qt}
                      addSelectedQuote={addSelectedQuote}
                      removeSelectedQuote={removeSelectedQuote}
                    />
                  )) }
                </div>
              </div>
            )}
        </section>
      )}
      <CopyInfoQuotesModal open={openCopyModal} toggleModal={toggleCopyModal} selectedQuotes={selectedQuotes} />
    </main>
  )
}