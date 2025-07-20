import { object, ref, string } from "yup";
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

// Reset Password
export type ResetPasswordFormData = {
  password: string
  confirmPassword: string
}

//#region Validation schemas
const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

const emailValidation = string().email(ERROR_INVALID_EMAIL).required(ERROR_EMAIL_REQUIRED).matches(emailRegex, ERROR_INVALID_EMAIL);

const passwordValidation = (requiredMessage: string, onlyRequired = false) => {
  if (onlyRequired) return string().required(requiredMessage);
  return string()
    .required(requiredMessage)
    .min(16, 'La contraseña debe tener al menos 16 caracteres. Ingrese más caracteres')
    .max(40, 'La contraseña puede tener un máximo de 40 caracteres. Ha excedido los 40 caracteres')
    .matches(/[A-Z]+/, 'La contraseña debe contener al menos 1 mayúscula')
    .matches(/[a-z]+/, 'La contraseña debe contener al menos 1 minúscula')
    .matches(/[0-9]+/, 'La contraseña debe contener al menos 1 número')
    .matches(/^\S*$/, 'La contraseña no debe contener espacios en blanco.')
    .matches(
      /[!@#$%^&*()[\]{}+*\-_.,;:/<>?=`~\\|']+/,
      'La contraseña debe contener al menos 1 caracter especial como !@#$%^&*()[]{}+*-_.,;:/<>?=`~|\\|',
    );
};

const confirmPasswordValidation = string()
  .required('Por favor, ingrese su contraseña nuevamente')
  .oneOf([ref('password')], 'Contraseña y confirmar contraseña deben ser iguales.');

export const LoginSchema = object({
  email: emailValidation,
  password: string().required(ERROR_PASSWORD_REQUIRED)
})

export const ForgotPasswordSchema = object({
  email: emailValidation
})

export const ResetPasswordSchema = object({
  password: passwordValidation('Por favor, ingrese una contraseña'),
  confirmPassword: confirmPasswordValidation,
})