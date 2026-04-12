import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { CreateGuidePkkPayload, CreateMnGuideResponse, GetSingleGuideResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateGuidePkkPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/pkk/create-guide`
    const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(uri, payload, {
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

export async function GET(request: Request) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url);
    const guideParam = searchParams.get("guide");
    if (!guideParam) {
      return NextResponse.json({ message: 'missing guide parameter' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/pkk/get-single-guide/${guideParam}`
    const res: AxiosResponse<GetSingleGuideResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = res?.data
    const guide = data?.data?.guide
    return NextResponse.json({ guide }, { status: 200 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}