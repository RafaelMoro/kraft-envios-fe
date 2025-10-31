import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { CreateAddressGEPayload, CreateAddressGEResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateAddressGEPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/quotes/create-address`
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.post(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(res.data, { status: 201 })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}