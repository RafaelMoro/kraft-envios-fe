import axios, { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { getAccessToken } from '@/shared/lib/auth.lib'
import { CancelBalanceRequestResponse } from '@/shared/types/balance.types'

export async function PATCH(
  _request: NextRequest,
  context: { params: { requestId: string } }
): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const requestId = context?.params?.requestId
    if (!requestId) {
      return NextResponse.json({ message: 'missing requestId' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/balance/requests/${encodeURIComponent(requestId)}/cancel`
    const response: AxiosResponse<CancelBalanceRequestResponse> = await axios.patch(uri, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }

    return NextResponse.json({ message: 'Failed to cancel balance request' }, { status: 500 })
  }
}
