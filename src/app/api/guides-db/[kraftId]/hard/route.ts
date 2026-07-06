import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken, getUserInfo } from "@/shared/lib/auth.lib"
import { DeleteGuideDbResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function DELETE(
  _request: NextRequest,
  context: { params: { kraftId: string } },
) {
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

    const kraftId = context?.params?.kraftId
    if (!kraftId) {
      return NextResponse.json({ message: 'missing kraftId' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}/hard`
    const res: AxiosResponse<DeleteGuideDbResponse> = await axios.delete(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
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
