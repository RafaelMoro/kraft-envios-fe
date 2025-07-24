import axios from 'axios'
import { LoginData, LoginPayload } from "@/shared/types/login.types"

export const LoginMutationCb = (data: LoginPayload): Promise<LoginData> => {
  return axios.post('/api', data)
}