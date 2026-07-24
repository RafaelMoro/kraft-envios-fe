import axios, { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { getAccessToken } from '@/shared/lib/auth.lib'
import { GetBalanceRequestsResponse } from '@/shared/types/balance.types'

const ALLOWED_PARAMS = ['month', 'year', 'page', 'limit'] as const

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const forwarded: Record<string, string> = {}
    for (const key of ALLOWED_PARAMS) {
      const value = request.nextUrl.searchParams.get(key)
      if (value !== null) forwarded[key] = value
    }

    const response: AxiosResponse<GetBalanceRequestsResponse> = await axios.get(
      `${process.env.BACKEND_URI}/balance/requests`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: forwarded
      }
    )

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }

    return NextResponse.json({ message: 'Failed to fetch balance requests' }, { status: 500 })
  }
}
