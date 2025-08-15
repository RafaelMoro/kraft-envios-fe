import axios, { AxiosResponse } from "axios";
import { type NextRequest, NextResponse } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";
import { GetQuoteData, GetQuoteForm } from "@/shared/types/quotes.types";
import { getAccessToken } from "@/shared/lib/auth.lib";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: GetQuoteForm = await request.json()
    const uri = `${process.env.BACKEND_URI}/quote`
    const res: AxiosResponse<GetQuoteData> = await axios.post(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return NextResponse.json({ data: res.data }, { status: 201 })

  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}