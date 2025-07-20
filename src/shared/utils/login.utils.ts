import axios from 'axios'
import { CreateUserData, CreateUserPayload, ForgotPasswordData, ForgotPasswordPayload, LoginData, LoginPayload, ResetPasswordData, ResetPasswordPayload } from "../types/login.types"

export const LoginMutationCb = (data: LoginPayload): Promise<LoginData> => {
  return axios.post('/api', data)
}

export const forgotPasswordCb = (data: ForgotPasswordPayload): Promise<ForgotPasswordData> => {
  return axios.post('/api/auth/forgot-password', data)
}

export const resetPasswordCb = (data: ResetPasswordPayload, slug: string): Promise<ResetPasswordData> => {
  return axios.post('/api/auth/reset-password', { data, slug })
}

export const createUserCb = (data: CreateUserPayload): Promise<CreateUserData> => {
  return axios.post('/api/auth/create-user', data)
}