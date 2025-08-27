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