import { QuoteCourier, ProviderSource } from "./quotes.types";

export type ProfitMarginType = 'percentage' | 'absolute'

export type MarginProfitSubscreens = 'view' | 'edit'

/**
 * Type used for the profit margin form selection input
 */
export type ProfitMarginTypeOption = {
  label: string;
  value: ProfitMarginType;
}

export interface ProfitMargin {
  value: number;
  type: ProfitMarginType
}

export interface CourierGlobalConfig {
  name: QuoteCourier;
  profitMargin: ProfitMargin;
}

export interface ProviderGlobalConfig {
  name: ProviderSource;
  couriers: CourierGlobalConfig[];
}


export interface MarginProfitResponse {
  data: {
    providers: ProviderGlobalConfig[]
  }
  error: null;
  message: null;
  messages: string[]
  success: boolean;
  version: string;
}

export type UpdateMarginProfitPayload = {
  providers: ProviderGlobalConfig[]
}

export type CourierForm = {
  id: string
  value: number | null;
  courier: QuoteCourier;
  profitMarginType: ProfitMarginTypeOption;
}
