import axios, { AxiosResponse } from 'axios'
import { NextResponse } from 'next/server'

import { getAccessToken } from '@/shared/lib/auth.lib'
import {
  CreateBalanceRequestPayload,
  CreateBalanceRequestResponse,
  GetBalanceResponse
} from '@/shared/types/balance.types'

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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const body = (await request.json()) as CreateBalanceRequestPayload
    const payload: CreateBalanceRequestPayload = {
      amount: body.amount
    }

    const response: AxiosResponse<CreateBalanceRequestResponse> = await axios.post(
      `${process.env.BACKEND_URI}/balance/requests`,
      payload,
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

    return NextResponse.json({ message: 'Failed to create balance request' }, { status: 500 })
  }
}
