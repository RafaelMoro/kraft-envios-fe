import { AxiosError, AxiosResponse } from "axios";
import { string } from "yup";

import { CreateAddressGEPayload } from "./guides.types";
import { ZIPCODE_ERROR_EMPTY, ZIPCODE_LENGTH_ERROR, ZIPCODE_ONLY_NUMBERS_ERROR } from "../constants/addresses.constants";

export type ThemeMode = 'light' | 'dark';

export type ErrorCatched = {
  message: string;
  cause?: {
    code: string
  }
}

export type GeneralError = {
  response: {
    data: {
      error: {
        message: string;
      }
    }
  }
}

export interface GeneralApiError extends Omit<AxiosError, 'response'> {
  response: AxiosResponse<{
    message: string;
  }>;
}

export type CookieObject = {
  name: string;
  value: string;
};

export type UserRoles = 'user' | 'admin'

export interface LadaStates {
  state: string;
  lada: string[];
}

export type KraftEnviosLocalStorage = {
  'pending-GE-addresses': CreateAddressGEPayload[]
}

//#region Schemas

export const zipcodeValidation = string()
  .required(ZIPCODE_ERROR_EMPTY)
  .matches(/^\d+$/, {
    excludeEmptyString: true,
    message: ZIPCODE_ONLY_NUMBERS_ERROR,
  })
  .min(5, ZIPCODE_LENGTH_ERROR)
  .max(5, ZIPCODE_LENGTH_ERROR)