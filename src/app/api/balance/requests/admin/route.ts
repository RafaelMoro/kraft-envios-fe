import axios, { AxiosResponse } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { getAccessToken, getUserInfo } from '@/shared/lib/auth.lib'
import { GetAdminBalanceRequestsResponse } from '@/shared/types/balance.types'

const ALLOWED_PARAMS = ['month', 'year', 'page', 'limit', 'status'] as const

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const forwarded: Record<string, string> = {}
    for (const key of ALLOWED_PARAMS) {
      const value = request.nextUrl.searchParams.get(key)
      if (value !== null) forwarded[key] = value
    }

    const response: AxiosResponse<GetAdminBalanceRequestsResponse> = await axios.get(
      `${process.env.BACKEND_URI}/balance/requests/admin`,
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

    return NextResponse.json({ message: 'Failed to fetch admin balance requests' }, { status: 500 })
  }
}
