import axios, { AxiosResponse } from "axios";
import { NextResponse } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";
import { GetMarginProfitData } from "@/shared/types/margin-profit.types";
import { getAccessToken } from "@/shared/lib/auth.lib";

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
    const uri = `${process.env.BACKEND_URI}/global-configs/profit-margin`
    const res: AxiosResponse<GetMarginProfitData> = await axios.get(uri, {
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