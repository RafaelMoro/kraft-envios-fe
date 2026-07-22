import axios, { AxiosResponse } from 'axios'
import { NextResponse } from 'next/server'

import { getAccessToken } from '@/shared/lib/auth.lib'
import { GetBalanceResponse } from '@/shared/types/balance.types'

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const response: AxiosResponse<GetBalanceResponse> = await axios.get(
      `${process.env.BACKEND_URI}/balance`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }

    return NextResponse.json({ message: 'Failed to fetch balance' }, { status: 500 })
  }
}
