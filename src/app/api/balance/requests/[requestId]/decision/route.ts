import axios, { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { getAccessToken, getUserInfo } from '@/shared/lib/auth.lib'
import { BalanceDecisionPayload, DecideBalanceRequestResponse } from '@/shared/types/balance.types'

export async function PATCH(
  request: NextRequest,
  context: { params: { requestId: string } }
): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    // ponytail: defensive guard, backend authorization is the source of truth
    const userInfo = await getUserInfo()
    const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo.data.user.role.includes('admin')
    if (!isAdmin) {
      return NextResponse.json({ message: 'admin only' }, { status: 403 })
    }

    const requestId = context?.params?.requestId
    if (!requestId) {
      return NextResponse.json({ message: 'missing requestId' }, { status: 400 })
    }

    const body = (await request.json()) as BalanceDecisionPayload
    const payload: BalanceDecisionPayload =
      body.action === 'approve'
        ? { action: 'approve', paymentReference: body.paymentReference }
        : { action: 'reject', ...(body.reason ? { reason: body.reason } : {}) }

    const uri = `${process.env.BACKEND_URI}/balance/requests/${encodeURIComponent(requestId)}/decision`
    const response: AxiosResponse<DecideBalanceRequestResponse> = await axios.patch(uri, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }

    return NextResponse.json({ message: 'Failed to decide balance request' }, { status: 500 })
  }
}
