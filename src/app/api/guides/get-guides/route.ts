import axios, { AxiosResponse } from "axios"
import { NextResponse } from "next/server"

import { getAccessToken } from "@/shared/lib/auth.lib"
import { GetGuidesResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types"

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
    const uri = `${process.env.BACKEND_URI}/guides`
    const res: AxiosResponse<GetGuidesResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const responseGotten = res?.data
    const messages = responseGotten?.messages ?? []
    const guides = res?.data?.data?.guides || [];
    return NextResponse.json({ guides, messages }, { status: 200 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}