import { AxiosResponse } from "axios"
import { number, object, ObjectSchema, string } from "yup"

//#region Interfaces and types
export interface Quote {
  id: string
  service: string
  total: number
  source: string
}

export interface QuoteUI extends Quote {
  amountFormatted: string
  logoSrc: QuoteImage;
}

export type ProviderImg = 'dhl' | 'estafeta' | 'fedex' | 'ups' | 'paquetexpres' | 'other'
export type QuoteImgDict = {
  dhl: QuoteImage;
  estafeta: QuoteImage;
  fedex: QuoteImage;
  ups: QuoteImage;
  paquetexpres: QuoteImage;
  other: QuoteImage;
}

export type QuoteImage = {
  source: string;
  provider: ProviderImg;
  width: number;
  height: number;
}

//#region Responses
export interface GetQuoteData {
  data: {
    quotes: Quote[]
  }
  error: null;
  message: null;
  messages: string[]
  success: boolean;
  version: string;
}

// Axios response shape currently accessed as response.data.data.data.quotes
// (three nested `data` objects before reaching `quotes`).
// Adjust if backend envelope changes to reduce nesting.
export type GetQuoteDataAxios = AxiosResponse<{
  data: {
    data: {
      quotes: Quote[]
      error: null
      message: null
      messages: string[]
      success: boolean
      version: string
    }
  }
}>

export type GetQuoteForm = {
  originPostalCode: string
  destinationPostalCode: string
  weight: number
  length: number
  height: number
  width: number
}

//#region Schemas
export const QuoteFormSchema: ObjectSchema<GetQuoteForm> = object().shape({
  originPostalCode: string().required('La dirección postal de origen es requerida').min(5, 'La dirección postal de origen debe tener 5 caracteres').max(5, 'La dirección postal de origen debe tener 5 caracteres'),
  destinationPostalCode: string().required('La dirección postal de destino es requerida').min(5, 'La dirección postal de destino debe tener 5 caracteres').max(5, 'La dirección postal de destino debe tener 5 caracteres'),
  weight: number().required('El peso del paquete es requerido').min(1, 'El peso debe ser mayor que 0'),
  length: number().required('El largo del paquete es requerido').min(1, 'El largo debe ser mayor que 0'),
  height: number().required('La altura del paquete es requerida').min(1, 'La altura debe ser mayor que 0'),
  width: number().required('El ancho del paquete es requerido').min(1, 'El ancho debe ser mayor que 0'),
})