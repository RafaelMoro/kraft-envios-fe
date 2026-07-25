import axios, { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { getAccessToken, getUserInfo } from '@/shared/lib/auth.lib'
import { GetAdminBalanceRequestResponse } from '@/shared/types/balance.types'

export async function GET(
  _request: NextRequest,
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

    const uri = `${process.env.BACKEND_URI}/balance/requests/admin/${encodeURIComponent(requestId)}`
    const response: AxiosResponse<GetAdminBalanceRequestResponse> = await axios.get(uri, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }

    return NextResponse.json({ message: 'Failed to fetch admin balance request' }, { status: 500 })
  }
}
