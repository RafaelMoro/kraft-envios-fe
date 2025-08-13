import axios from 'axios'
import { GetQuoteData, GetQuoteForm, QuoteImage } from "../types/quotes.types"
import { GET_QUOTE_API_ENDPOINT } from '../constants/global.constants'

export const getQuoteMutationCb = (data: GetQuoteForm): Promise<GetQuoteData> => {
  return axios.post(GET_QUOTE_API_ENDPOINT, data)
}

export const getQuoteImg = (service: string): QuoteImage => {
  const serviceLowerCase = service.toLowerCase()

  const isDhl = serviceLowerCase.includes('dhl')
  const isEstafeta = serviceLowerCase.includes('estafeta')
  const isUps = serviceLowerCase.includes('ups')
  const isPaqueteExpress = serviceLowerCase.includes('paquetexpres')
  const isFedex = serviceLowerCase.includes('fedex')

  const quoteImgDict: Record<string, QuoteImage> = {
    "dhl": {
      source: "/img/dhl-logo.svg",
      width: 90,
      height: 30
    },
    "estafeta": {
      source: "/img/estafeta-logo.svg",
      width: 90,
      height: 30
    },
    "fedex": {
      source: "/img/fedex-logo.webp",
      width: 88,
      height: 25
    },
    "ups": {
      source: "/img/ups-logo.svg",
      width: 30,
      height: 30
    },
    "paquetexpres": {
      source: "paquetexpres",
      width: 30,
      height: 30
    },
    "none": {
      source: "none",
      width: 30,
      height: 30
    }
  }

  if (isDhl) return quoteImgDict["dhl"]
  if (isEstafeta) return quoteImgDict["estafeta"]
  if (isUps) return quoteImgDict["ups"]
  if (isPaqueteExpress) return quoteImgDict["paquetexpres"]
  if (isFedex) return quoteImgDict["fedex"]

  return quoteImgDict["none"]
}