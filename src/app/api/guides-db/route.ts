import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { CreateGuideDbPayload, CreateGuideDbResponse, GetGuidesDbResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const { searchParams } = request.nextUrl
    const params: Record<string, string> = {}
    const entries = ['page', 'month', 'year', 'limit', 'scope', 'includeDeleted', 'includeInternalPricing']
    for (const key of entries) {
      const value = searchParams.get(key)
      if (value !== null) {
        params[key] = value
      }
    }

    const scope = searchParams.get('scope')
    const path = scope === 'all' || scope === 'own' ? '/guides/db/admin' : '/guides/db'
    const uri = `${process.env.BACKEND_URI}${path}`
    const res: AxiosResponse<GetGuidesDbResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params,
    })

    return NextResponse.json(res.data, { status: 200 })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
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

    const payload: CreateGuideDbPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/guides/db/create`
    const res: AxiosResponse<CreateGuideDbResponse> = await axios.post(uri, payload, {
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
