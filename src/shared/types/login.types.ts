import { object, string } from "yup";
import { ERROR_EMAIL_REQUIRED, ERROR_INVALID_EMAIL, ERROR_PASSWORD_REQUIRED } from "../constants/login.constants";
import { AxiosError, AxiosResponse } from "axios";

//#region Payload / Responses
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

// Forgot Password
export interface ForgotPasswordPayload {
  email: string
}

export interface ForgotPasswordData {
  data: null
  error: null;
  message: 'Email Sent';
  success: boolean;
  version: string;
}

export interface ForgotPasswordError extends Omit<AxiosError, 'response'> {
  response: AxiosResponse<{
    error: {
      message: string;
    }
  }>;
}

//#region Validation schemas
const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

const emailValidation = string().email(ERROR_INVALID_EMAIL).required(ERROR_EMAIL_REQUIRED).matches(emailRegex, ERROR_INVALID_EMAIL);

export const LoginSchema = object({
  email: emailValidation,
  password: string().required(ERROR_PASSWORD_REQUIRED)
})

export const ForgotPasswordSchema = object({
  email: emailValidation
})