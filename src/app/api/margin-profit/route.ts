import axios, { AxiosResponse } from "axios";
import { NextResponse, type NextRequest } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";
import { MarginProfitResponse, UpdateMarginProfitPayload } from "@/shared/types/margin-profit.types";
import { getAccessToken } from "@/shared/lib/auth.lib";

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
    const uri = `${process.env.BACKEND_URI}/global-configs/profit-margin`
    const res: AxiosResponse<MarginProfitResponse> = await axios.get(uri, {
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

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const payload: UpdateMarginProfitPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/global-configs/profit-margin-providers`
    const res: AxiosResponse<MarginProfitResponse> = await axios.put(uri, payload, {
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