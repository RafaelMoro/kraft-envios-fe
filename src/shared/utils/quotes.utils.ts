import axios from 'axios'
import { GetQuoteData, GetQuoteForm } from "../types/quotes.types"
import { GET_QUOTE_API_ENDPOINT } from '../constants/global.constants'

export const getQuoteMutationCb = (data: GetQuoteForm): Promise<GetQuoteData> => {
  return axios.post(GET_QUOTE_API_ENDPOINT, data)
}