import { number, object, ObjectSchema } from "yup";

export type ProfitMarginType = 'percentage' | 'absolute'

export interface ProfitMargin {
  value: number;
  type: ProfitMarginType
}


export interface GetMarginProfitData {
  data: {
    profitMargin: ProfitMargin[]
  }
  error: null;
  message: null;
  messages: string[]
  success: boolean;
  version: string;
}

export type MarginProfitForm = {
  value: number
}

export const MarginProfitSchema: ObjectSchema<MarginProfitForm> = object().shape({
  value: number().required('Por favor, ingrese el valor del margen de ganancia').min(1, 'El valor debe ser mayor que 0'),
})
