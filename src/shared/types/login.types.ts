import { object, ObjectSchema, ref, string } from "yup";
import { ERROR_EMAIL_REQUIRED, ERROR_INVALID_EMAIL, ERROR_PASSWORD_REQUIRED } from "../constants/login.constants";
import { AxiosError, AxiosResponse } from "axios";

export type ResetPasswordStatus = "idle" | "success" | "error"
export type MessageCardState = {
  show: boolean;
  status: ResetPasswordStatus;
}

export type PersonalInformationForm = {
  name: string
  lastName: string
  phone: string
}

export type CompanyDetailsForm = {
  companyName?: string | null | undefined
  address?: string | null | undefined
  postalCode: string
  secondPhoneNumber?: string | null | undefined
}

export type UserPasswordForm = {
  email: string
  password: string
  confirmPassword: string
}

export type FormDataRegister = {
  personalInformation: PersonalInformationForm
  companyDetails: CompanyDetailsForm
  userPassword: UserPasswordForm
}

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

export type ResetPasswordPayload = {
  password: string
}

export interface ResetPasswordData {
  data: null
  error: null;
  message: 'Reset password successfully';
  success: boolean;
  version: string;
}

export interface ResetPasswordError extends Omit<AxiosError, 'response'> {
  response: AxiosResponse<{
    error: {
      message: string;
    }
  }>;
}

// Create User
export type CreateUserPayload = {
  name: string
  lastName: string
  email: string
  password: string
  phone: string
  postalCode: string
  companyName: string
  secondPhone: string
  address: string
  role: []
}

export interface CreateUserData {
  data: {
    user: {
			email: string;
			name: string;
      lastName: string;
      role: ["user"]
		}
  }
  error: null;
  message: null;
  success: boolean;
  version: string;
}

export interface CreateUserError extends Omit<AxiosError, 'response'> {
  response: AxiosResponse<{
    error: {
      error: string
    }
  }>;
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

export const PersonalInformationSchema: ObjectSchema<PersonalInformationForm> = object({
  firstName: string().required('Nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: string().required('Apellido es requerido').min(2, 'El apellido debe tener al menos 2 caracteres')
})

export const CompanyDetailsSchema: ObjectSchema<CompanyDetailsForm> = object().shape({
  companyName: string()
    .nullable()
    .notRequired()
    .when('companyName', {
      is: (value: string) => value?.length,
      then: (rule) => rule.min(2, 'El nombre de la compañia debe tener al menos 2 caracteres'),
    }),
  address: string()
    .nullable()
    .notRequired()
    .when('address', {
      is: (value: string) => value?.length,
      then: (rule) => rule.min(2, 'La dirección debe tener al menos 2 caracteres'),
    }),
  postalCode: string().required('La dirección postal es requerida').min(4, 'La dirección postal debe tener 4 caracteres').max(4, 'La dirección postal debe tener 4 caracteres'),
  secondPhoneNumber: string()
    .nullable()
    .notRequired()
    .when('secondPhoneNumber', {
      is: (value: string) => value?.length,
      then: (rule) => rule.matches(/^\d+$/, { excludeEmptyString: true, message: "El teléfono solo puede contener dígitos" })
        .min(10, 'El teléfono debe tener 10 dígitos')
        .max(10, 'El teléfono debe tener 10 dígitos'),
    }),
}, [
  ["companyName", "companyName"],
  ["address", "address"],
  ["secondPhoneNumber", "secondPhoneNumber"]
])

export const UserAndPasswordSchema = object().shape({
  email: emailValidation,
  password: passwordValidation('Por favor, ingrese una contraseña'),
  confirmPassword: confirmPasswordValidation,
})