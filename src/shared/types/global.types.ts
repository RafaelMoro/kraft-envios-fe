import { AxiosError, AxiosResponse } from "axios";

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