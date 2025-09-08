import axios from 'axios'
import { GetQuoteForm, ProviderImg, QuoteCourier, QuoteImage, QuoteImgDict, QuoteSource, QuoteTypeService, QuoteUI } from "../types/quotes.types"
import { GET_QUOTE_API_ENDPOINT } from '../constants/global.constants'

export const getQuoteMutationCb = (data: GetQuoteForm) => {
  return axios.post(GET_QUOTE_API_ENDPOINT, data)
}

export const categorizeImg = (courier: QuoteCourier | null): ProviderImg => {
  if (!courier) return 'other'

  if (courier === 'DHL') return 'dhl'
  if (courier === 'Estafeta') return 'estafeta'
  if (courier === 'UPS') return 'ups'
  if (courier === 'Paquetexpress') return 'paquetexpres'
  if (courier === 'Fedex') return 'fedex'
  if (courier === 'NextDay') return 'ninetyNineMin'
  if (courier === 'AMPM') return 'ampm'

  // Fallback to 'other' as the last option
  return 'other'
}

export const getQuoteImg = ({
  courier,
  isMobile,
}: {
  courier: QuoteCourier | null;
  isMobile: boolean;
}): QuoteImage => {
  const provider = categorizeImg(courier)

  const quoteImgDict: QuoteImgDict = {
    "dhl": {
      source: "/img/dhl-logo.svg",
      provider: "dhl",
      width: 90,
      height: 30
    },
    "estafeta": {
      source: "/img/estafeta-logo.svg",
      provider: "estafeta",
      width: 90,
      height: 30
    },
    "fedex": {
      source: "/img/fedex-logo.webp",
      provider: "fedex",
      width: isMobile ? 64 : 88,
      height: isMobile ? 18 : 25
    },
    "ups": {
      source: "/img/ups-logo.svg",
      provider: "ups",
      width: 30,
      height: 30
    },
    "paquetexpres": {
      source: "paquetexpres",
      provider: "paquetexpres",
      width: isMobile ? 15 : 30,
      height: isMobile ? 15 : 30
    },
    "ninetyNineMin": {
      source: "/img/99min-logo.svg",
      provider: "ninetyNineMin",
      width: isMobile ? 40 : 60,
      height: isMobile ? 40 : 60
    },
    "ampm": {
      source: "/img/ampm-logo.svg",
      provider: "ampm",
      width: isMobile ? 90 : 120,
      height: isMobile ? 90 : 120
    },
    "other": {
      source: "/kraft-logo.svg",
      provider: "other",
      width: 100,
      height: 50
    }
  }

  if (provider === 'dhl') return quoteImgDict["dhl"]
  if (provider === 'estafeta') return quoteImgDict["estafeta"]
  if (provider === 'ups') return quoteImgDict["ups"]
  if (provider === 'paquetexpres') return quoteImgDict["paquetexpres"]
  if (provider === 'fedex') return quoteImgDict["fedex"]

  if (provider === 'ninetyNineMin') return quoteImgDict["ninetyNineMin"]
  if (provider === 'ampm') return quoteImgDict["ampm"]

  return quoteImgDict["other"]
}

// Replace underscores with spaces in a service name and trim extra whitespace
export const formatQuoteServiceName = (service: string): string => {
  return service
    .replace(/_/g, ' ') // underscores to spaces
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}

export const filterQuotesByCourierUtil = (quotes: QuoteUI[], courier: QuoteCourier): QuoteUI[] => {
  return quotes.filter((qt) => qt.courier === courier)
}

export const filterQuotesBySourceUtil = (quotes: QuoteUI[], source: QuoteSource) => {
  return quotes.filter((qt) => qt.source === source)
}

export const filterQuotesByTimeTypeUtil = (quotes: QuoteUI[], timeType: QuoteTypeService): QuoteUI[] => {
  return quotes.filter((qt) => qt.typeService === timeType)
}

export const formatQuotesSendWhatsapp = (quotes: QuoteUI[]): string => {
  const quotesFormatted = quotes.map((quote) => `${quote.service} - ${quote.amountFormatted}`)
  return quotesFormatted.join(' | ')
}