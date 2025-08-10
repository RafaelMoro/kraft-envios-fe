import { number, object, ObjectSchema, string } from "yup"

export interface Quote {
  id: string
  service: string
  total: number
  source: string
}

export interface QuoteUI extends Quote {
  amountFormatted: string
}

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

export type GetQuoteForm = {
  originPostalCode: string
  destinationPostalCode: string
  weight: number
  length: number
  height: number
  width: number
}

export const QuoteFormSchema: ObjectSchema<GetQuoteForm> = object().shape({
  originPostalCode: string().required('La dirección postal de origen es requerida').min(5, 'La dirección postal de origen debe tener 5 caracteres').max(5, 'La dirección postal de origen debe tener 5 caracteres'),
  destinationPostalCode: string().required('La dirección postal de destino es requerida').min(5, 'La dirección postal de destino debe tener 5 caracteres').max(5, 'La dirección postal de destino debe tener 5 caracteres'),
  weight: number().required('El peso del paquete es requerido').min(1, 'El peso debe ser mayor que 0'),
  length: number().required('El largo del paquete es requerido').min(1, 'El largo debe ser mayor que 0'),
  height: number().required('La altura del paquete es requerida').min(1, 'La altura debe ser mayor que 0'),
  width: number().required('El ancho del paquete es requerido').min(1, 'El ancho debe ser mayor que 0'),
})