import axios from 'axios'
import { GetQuoteData, GetQuoteForm } from "../types/quotes.types"
import { GET_QUOTE_API_ENDPOINT } from '../constants/global.constants'

export const getQuoteMutationCb = (data: GetQuoteForm): Promise<GetQuoteData> => {
  return axios.post(GET_QUOTE_API_ENDPOINT, data)
}

export const getQuoteImg = (service: string) => {
  const serviceLowerCase = service.toLowerCase()

  const isDhl = serviceLowerCase.includes('dhl')
  const isEstafeta = serviceLowerCase.includes('estafeta')
  const isUps = serviceLowerCase.includes('ups')
  const isPaqueteExpress = serviceLowerCase.includes('paquetexpres') || serviceLowerCase.includes('express')
  const isFedex = serviceLowerCase.includes('fedex')

  const quoteImgDict: Record<string, string> = {
    "dhl": "/img/dhl-logo.svg",
    "estafeta": "/img/estafeta-logo.svg",
    "fedex": "/img/fedex-logo.webp",
    "ups": "/img/ups-logo.svg",
    "paquetexpres": "paquetexpres",
  }

  if (isDhl) return quoteImgDict["dhl"]
  if (isEstafeta) return quoteImgDict["estafeta"]
  if (isUps) return quoteImgDict["ups"]
  if (isPaqueteExpress) return quoteImgDict["paquetexpres"]
  if (isFedex) return quoteImgDict["fedex"]

  return "none"
}