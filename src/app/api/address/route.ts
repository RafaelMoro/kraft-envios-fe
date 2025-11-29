import axios, { AxiosResponse } from "axios";
import { type NextRequest, NextResponse } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";
import { getAccessToken } from "@/shared/lib/auth.lib";
import { CreateAddressPayload, CreateAddressResponse } from "@/shared/types/addresses.types";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateAddressPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/quotes`
    const res: AxiosResponse<CreateAddressResponse> = await axios.post(uri, payload, {
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