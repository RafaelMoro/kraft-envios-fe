import { AxiosError, AxiosResponse } from "axios";
import { object, string } from "yup";
import { ERROR_EMAIL_REQUIRED, ERROR_INVALID_EMAIL, ERROR_PASSWORD_REQUIRED } from "../constants/login.constants";

export interface LoginData {
  data: {
    user: {
      email: string;
      firstName: string;
      lastName: string;
      middleName: string;
      _id: string
      __v: number
    }
  }
  error: null;
  message: null;
  success: boolean;
  version: string;
}

export interface LoginError extends Omit<AxiosError, 'response'> {
  response: AxiosResponse<{
    message: string;
  }>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
const emailValidation = string().email(ERROR_INVALID_EMAIL).required(ERROR_EMAIL_REQUIRED).matches(emailRegex, ERROR_INVALID_EMAIL);

export const LoginSchema = object({
  email: emailValidation,
  password: string().required(ERROR_PASSWORD_REQUIRED)
})