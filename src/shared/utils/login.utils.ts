import axios from 'axios'
import { ForgotPasswordData, ForgotPasswordPayload, LoginData, LoginPayload } from "@/shared/types/login.types"

export const LoginMutationCb = (data: LoginPayload): Promise<LoginData> => {
  return axios.post('/api', data)
}

export const forgotPasswordCb = (data: ForgotPasswordPayload): Promise<ForgotPasswordData> => {
  return axios.post('/api/auth/forgot-password', data)
}