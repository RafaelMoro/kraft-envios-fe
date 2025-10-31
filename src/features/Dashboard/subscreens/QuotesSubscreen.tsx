import { useEffect, useRef, useState } from "react"
import { Button } from "flowbite-react"
import { RiStickyNoteAddLine } from "@remixicon/react"

import { QuoteForm } from "@/features/Quotes/QuoteForm"
import { LoginData } from "@/shared/types/login.types"
import { Quote, QuoteUI } from "@/shared/types/quotes.types"
import { formatNumberToCurrency } from "@/shared/utils/global.utils"
import { QuoteCard } from "@/features/Quotes/QuoteCard"
import { formatQuoteServiceName, formatQuotesSendWhatsapp, getQuoteImg } from "@/shared/utils/quotes.utils"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { CourierFilter } from "@/features/Quotes/CourierFilter"
import { SourceFilterDropdown } from "@/features/Quotes/SourceFilterDropdown"
import { TimeFilterDropdown } from "@/features/Quotes/TimeFilterDropdown"
import { useQuoteFilters } from "@/shared/hooks/useQuotesFilters"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { CopyInfoQuotesModal } from "@/features/Quotes/CopyInfoQuotesModal"
import { IntersectionObserverWrapper } from "@/shared/ui/organisms/IntersectionObserverWrapper"
import { SendInfoButton } from "@/shared/ui/atoms/SendInfoButton"
import { CopyQuotesButton } from "@/shared/ui/atoms/CopyQuotesButton"
import { CreateGuideModal } from "@/features/Guides/Mn/CreateGuideModal"
import { CreateGuideModalTone } from "@/features/Guides/Tone/CreateGuideModalTone"
import { CreateGuidePkk } from "@/features/Guides/Pkk/CreateGuidePkk"
import { PackageDimensions } from "@/shared/types/guides.types"
import { CreateGuideGE } from "@/features/Guides/GE/CreateGuideGE"

interface QuotesProps {
  userInfo: LoginData | null
}

export const QuotesSubscreen = ({ userInfo }: QuotesProps) => {
  const { isMobile } = useMediaQuery()

  // Reference to save package dimensions
  const packageDimensions = useRef<PackageDimensions | null>(null)
  const updatePackageDimensions = (dimensions: PackageDimensions) => {
    packageDimensions.current = dimensions
  }

  // Create Guide
  const [openCreateGuideMn, setOpenCreateGuideMn] = useState<boolean>(false)
  const toggleCreateGuideMn = () => setOpenCreateGuideMn((prev) => !prev)
  const [openCreateGuideTone, setOpenCreateGuideTone] = useState<boolean>(false)
  const toggleCreateGuideTone = () => setOpenCreateGuideTone((prev) => !prev)
  const [openCreateGuidePkk, setOpenCreateGuidePkk] = useState<boolean>(false)
  const toggleCreateGuidePkk = () => setOpenCreateGuidePkk((prev) => !prev)
  const [openCreateGuideGE, setOpenCreateGuideGE] = useState<boolean>(false)
  const toggleCreateGuideGE = () => setOpenCreateGuideGE((prev) => !prev)

  // Intersection observer states
  const [isIntersectingActionBar, setIsIntersectingActionBar] = useState<boolean>(true)
  const [isIntersectingForm, setIsIntersectingForm] = useState<boolean>(false)

  // All quotes and filtered quotes state
  const [allQuotes, setAllQuotes] = useState<QuoteUI[]>([])
  const [filteredQuotes, setAllFilteredQuotes] = useState<QuoteUI[]>([])

  // State used for the action bar
  const [selectedQuotes, setSelectedQuotes] = useState<QuoteUI[]>([])
  const [errorActionBar, setErrorActionBar] = useState<string | null>(null)
  const [openCopyModal, setOpenCopyModal] = useState<boolean>(false)
  const [successCopyActionBar, setSuccessCopyActionBar] = useState<string | null>(null)
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
  const resetSelectedQuotes = () => setSelectedQuotes([])

  const handleSendInfo = () => {
    if (selectedQuotes.length === 0) {
      setErrorActionBar('Debes seleccionar al menos una cotización para mandar la información via Whatsapp.')
      return
    }
    toggleCopyModal()
  }

  const handleCopyInfo = async () => {
    if (selectedQuotes.length === 0) {
      setErrorActionBar('Debes seleccionar al menos una cotización para copiar su información.')
      return
    }

    try {
      const message = formatQuotesSendWhatsapp(selectedQuotes)
      await navigator.clipboard.writeText(message)
      const successMsg = isMobile ? 'Copiado' : 'Cotizaciones copiadas.'
      setSuccessCopyActionBar(successMsg)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      setErrorActionBar('Error al copiar las cotizaciones al portapapeles.')
    }
  }

  useEffect(() => {
    if (successCopyActionBar) {
      setTimeout(() => {
        setSuccessCopyActionBar(null)
      }, 2000)
    }
  }, [successCopyActionBar])

  const handleClickCreateGuide = () => {
    if (selectedQuotes.length === 0) {
      setErrorActionBar('Debes seleccionar una cotización para crear una guía.')
      return;
    }
    if (selectedQuotes.length > 1) {
      setErrorActionBar('Solo puede seleccionar una sola cotización para crear una guía.')
      return;
    }

    if (selectedQuotes[0].source === 'GE') {
      toggleCreateGuideGE()
      return;
    }

    if (selectedQuotes[0].source === 'TONE') {
      toggleCreateGuideTone()
      return;
    }
    if (selectedQuotes[0].source === 'Pkk') {
      toggleCreateGuidePkk()
      return;
    }

    toggleCreateGuideMn()
  }

  const handleCreateGuideQuoteCard = (quote: QuoteUI) => {
    setSelectedQuotes([quote])
    if (quote.source === 'GE') {
      toggleCreateGuideGE()
      return;
    }

    if (quote.source === 'TONE') {
      toggleCreateGuideTone()
      return;
    }

    if (quote.source === 'Pkk') {
      toggleCreateGuidePkk()
      return;
    }

    toggleCreateGuideMn()
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
      <IntersectionObserverWrapper setIntersecting={setIsIntersectingForm}>
        <QuoteForm
          updateQuotes={updateAllQuotes}
          resetSelectedQuotes={resetSelectedQuotes}
          resetFiltersQuotes={resetFiltersQuotes}
          updatePackageDimensions={updatePackageDimensions}
        />
      </IntersectionObserverWrapper>
      { allQuotes.length > 0 && (
        <section ref={quotesSectionRef} className="flex flex-col gap-4 align-center justify-center mt-7">
          <h2 className="text-2xl font-bold text-center">Cotizaciones</h2>
          <p className="text-gray-600 text-center mb-5">Aquí se mostrarán las cotizaciones generadas.</p>
          <IntersectionObserverWrapper setIntersecting={setIsIntersectingActionBar}>
            <div data-testid="quotes-action-bar" className="w-full flex justify-end gap-2">
              <CopyQuotesButton isMobile={isMobile} handleCopyInfo={handleCopyInfo} successCopyActionBar={successCopyActionBar} />
              <SendInfoButton isMobile={isMobile} handleSendInfo={handleSendInfo} />
              <Button data-testid="action-bar-create-guide-button" className="inline-flex gap-2" onClick={handleClickCreateGuide}>
                <RiStickyNoteAddLine size={20} />
                Crear guía
              </Button>
            </div>
          </IntersectionObserverWrapper>
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
                      isMobile={isMobile}
                      addSelectedQuote={addSelectedQuote}
                      removeSelectedQuote={removeSelectedQuote}
                      handleCreateGuide={handleCreateGuideQuoteCard}
                    />
                  )) }
                </div>
              </div>
            )}
        </section>
      )}
      { !isIntersectingActionBar && !isIntersectingForm && allQuotes.length > 0 && (
        <article data-testid="sticky-action-bar" className="sticky z-50 bottom-20 md:bottom-28 w-full flex justify-center md:justify-end">
          <div className="max-w-xl p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-2xl flex flex-col md:flex-row  justify-between gap-3 md:gap-5">
            <p className="text-gray-600 dark:text-gray-400">Cotizaciones seleccionadas: {selectedQuotes.length}</p>
            <CopyQuotesButton isMobile={isMobile} handleCopyInfo={handleCopyInfo} successCopyActionBar={successCopyActionBar} />
            <SendInfoButton isPrimary isMobile={isMobile} handleSendInfo={handleSendInfo} />
          </div>
        </article>
      )}
      <CopyInfoQuotesModal open={openCopyModal} toggleModal={toggleCopyModal} selectedQuotes={selectedQuotes} />
      <CreateGuideModal open={openCreateGuideMn} toggleModal={toggleCreateGuideMn} selectedQuotes={selectedQuotes} resetSelectedQuotes={resetSelectedQuotes} />
      <CreateGuideModalTone open={openCreateGuideTone} toggleModal={toggleCreateGuideTone} selectedQuotes={selectedQuotes} resetSelectedQuotes={resetSelectedQuotes} />
      <CreateGuidePkk
        open={openCreateGuidePkk}
        packageDimensions={packageDimensions.current}
        toggleModal={toggleCreateGuidePkk}
        resetSelectedQuotes={resetSelectedQuotes}
      />
      <CreateGuideGE
        open={openCreateGuideGE}
        packageDimensions={packageDimensions.current}
        selectedQuotes={selectedQuotes}
        toggleModal={toggleCreateGuideGE}
        resetSelectedQuotes={resetSelectedQuotes}
      />
    </main>
  )
}