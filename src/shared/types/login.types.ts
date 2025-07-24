import { AxiosError, AxiosResponse } from "axios";
import { object, string } from "yup";

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
const emailValidation = string().email('invalid email').required('email required').matches(emailRegex, 'invalid email');

export const LoginSchema = object({
  email: emailValidation,
  password: string().required('password required')
})