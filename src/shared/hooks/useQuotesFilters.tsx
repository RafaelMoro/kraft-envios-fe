import { useState } from "react"
import { QuoteCourier, ProviderSource, QuoteTypeService, QuoteUI } from "../types/quotes.types"
import { filterQuotesByCourierUtil, filterQuotesBySourceUtil, filterQuotesByTimeTypeUtil } from "../utils/quotes.utils"

interface UseQuotesFiltersProps {
  allQuotes: QuoteUI[]
  setAllFilteredQuotes: (quotes: QuoteUI[]) => void
}

export const useQuoteFilters = ({ allQuotes, setAllFilteredQuotes }: UseQuotesFiltersProps) => {
  // Track currently selected filters so they can be applied cumulatively
  const [selectedCourier, setSelectedCourier] = useState<QuoteCourier | null>(null)
  const [selectedSource, setSelectedSource] = useState<ProviderSource | null>(null)
  const [selectedTimeType, setSelectedTimeType] = useState<QuoteTypeService | null>(null)

  // Apply all currently selected filters to `allQuotes` in sequence.
  const applyActiveFilters = (opts?: {
    courier?: QuoteCourier | null
    source?: ProviderSource | null
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

  const filterQuotesBySource = (newSource: ProviderSource) => {
    setSelectedSource(newSource)
    const filtered = applyActiveFilters({ source: newSource })
    setAllFilteredQuotes(filtered)
  }

  const filterQuotesByTimeType = (newTimeType: QuoteTypeService) => {
    setSelectedTimeType(newTimeType)
    const filtered = applyActiveFilters({ timeType: newTimeType })
    setAllFilteredQuotes(filtered)
  }

  return {
    selectedCourier,
    selectedSource,
    selectedTimeType,
    filterQuotesByCourier,
    filterQuotesBySource,
    filterQuotesByTimeType,
    setSelectedCourier,
    setSelectedSource,
    setSelectedTimeType
  }
}