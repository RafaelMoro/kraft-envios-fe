import { AxiosResponse } from "axios"
import { number, object, ObjectSchema, string } from "yup"


// Runtime array of supported couriers. Keep this in sync if you add/remove providers.
export const QUOTE_COURIERS = [
  'Estafeta',
  'DHL',
  'UPS',
  'Fedex',
  'Paquetexpress',
  'AMPM',
  // Corresponding to 99 or 99MIN
  'NextDay',
  'Tres guerras'
] as const

export const QUOTE_SOURCES = [
  'GE',
  'TONE',
  'Pkk',
  'Mn'
] as const

export const QUOTE_SERVICE_TYPES = [
  'standard',
  'nextDay'
] as const

export const TYPE_PACKAGE = ['box', 'envelope'] as const

// Derive the type from the runtime constant so changing one source keeps both in sync.
export type QuoteCourier = typeof QUOTE_COURIERS[number]
export type QuoteSource = typeof QUOTE_SOURCES[number]
export type QuoteTypeService = typeof QUOTE_SERVICE_TYPES[number]

export type PackageType = typeof TYPE_PACKAGE[number]

//#region Interfaces and types
export interface Quote {
  id: string
  service: string
  total: number
  typeService: QuoteTypeService | null;
  courier: QuoteCourier | null;
  source: QuoteSource
}

export interface QuoteUI extends Quote {
  amountFormatted: string
  logoSrc: QuoteImage;
}

export type ProviderImg = 'dhl' | 'estafeta' | 'fedex' | 'ups' | 'paquetexpres' | 'ninetyNineMin' | 'ampm' | 'other'
export type QuoteImgDict = {
  dhl: QuoteImage;
  estafeta: QuoteImage;
  fedex: QuoteImage;
  ups: QuoteImage;
  paquetexpres: QuoteImage;
  ninetyNineMin: QuoteImage;
  ampm: QuoteImage;
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
  weight: number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('El peso del paquete es requerido')
    .min(1, 'El peso debe ser mayor que 0'),
  length: number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('El largo del paquete es requerido').min(1, 'El largo debe ser mayor que 0'),
  height: number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('La altura del paquete es requerida').min(1, 'La altura debe ser mayor que 0'),
  width: number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('El ancho del paquete es requerido').min(1, 'El ancho debe ser mayor que 0'),
})