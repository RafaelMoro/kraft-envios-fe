import axios from 'axios'
import { CreateUserData, CreateUserPayload, ForgotPasswordData, ForgotPasswordPayload, LoginData, LoginPayload, ResetPasswordData, ResetPasswordPayload } from "@/shared/types/login.types"
import { CREATE_USER_API_ENDPOINT, FORGOT_PASSWORD_API_ENDPOINT, LOGIN_API_ENDPOINT, RESET_PASSWORD_API_ENDPOINT } from '../constants/global.constants'

export const LoginMutationCb = (data: LoginPayload): Promise<LoginData> => {
  return axios.post(LOGIN_API_ENDPOINT, data)
}

export const forgotPasswordCb = (data: ForgotPasswordPayload): Promise<ForgotPasswordData> => {
  return axios.post(FORGOT_PASSWORD_API_ENDPOINT, data)
}

export const resetPasswordCb = (data: ResetPasswordPayload, slug: string): Promise<ResetPasswordData> => {
  return axios.post(RESET_PASSWORD_API_ENDPOINT, { data, slug })
}

export const createUserCb = (data: CreateUserPayload): Promise<CreateUserData> => {
  return axios.post(CREATE_USER_API_ENDPOINT, data)
}