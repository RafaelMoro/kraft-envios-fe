import { NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { GetAliasAddressesGEResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const uri = `${process.env.BACKEND_URI}/ge/alias-addresses`
    const res: AxiosResponse<GetAliasAddressesGEResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const aliasAddresses = res?.data?.data?.aliases
    return NextResponse.json({ aliases: aliasAddresses }, { status: 200 })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}