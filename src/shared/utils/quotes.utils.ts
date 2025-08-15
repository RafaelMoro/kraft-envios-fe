import axios from 'axios'
import { GetQuoteForm, ProviderImg, QuoteImage, QuoteImgDict } from "../types/quotes.types"
import { GET_QUOTE_API_ENDPOINT } from '../constants/global.constants'

export const getQuoteMutationCb = (data: GetQuoteForm) => {
  return axios.post(GET_QUOTE_API_ENDPOINT, data)
}

export const categorizeImg = (service: string): ProviderImg => {
  const serviceLowerCase = service.toLowerCase()

  const isDhl = serviceLowerCase.includes('dhl')
  const isEstafeta = serviceLowerCase.includes('estafeta')
  const isUps = serviceLowerCase.includes('ups')
  const isPaqueteExpress = serviceLowerCase.includes('paquetexpres')
  const isFedex = serviceLowerCase.includes('fedex')

  if (isDhl) return 'dhl'
  if (isEstafeta) return 'estafeta'
  if (isUps) return 'ups'
  if (isPaqueteExpress) return 'paquetexpres'
  if (isFedex) return 'fedex'

  return 'other'
}

export const getQuoteImg = (service: string, isMobile: boolean): QuoteImage => {
  const serviceLowerCase = service.toLowerCase()
  const provider = categorizeImg(serviceLowerCase)

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

  return quoteImgDict["other"]
}

// Replace underscores with spaces in a service name and trim extra whitespace
export const formatQuoteServiceName = (service: string): string => {
  return service
    .replace(/_/g, ' ') // underscores to spaces
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}
