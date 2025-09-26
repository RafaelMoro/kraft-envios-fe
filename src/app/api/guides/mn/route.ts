import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { CreateGuideMnPayload, CreateMnGuideResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateGuideMnPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/mn/create-guide`
    const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (res?.data?.data?.guide === null || res?.data?.messages.some((mess) => mess.toLowerCase().includes('request failed with status code 400'))) {
      return NextResponse.json({ message: 'Error creating guide' }, { status: 400 })
    }

    return NextResponse.json(res.data, { status: 201 })

  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}