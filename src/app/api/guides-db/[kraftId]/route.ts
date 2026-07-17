import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { DeleteGuideDbResponse, UpdateGuideDbPayload, UpdateGuideDbResponse } from "@/shared/types/guides.types"
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

    const kraftId = context?.params?.kraftId
    if (!kraftId) {
      return NextResponse.json({ message: 'missing kraftId' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}`
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

export async function PATCH(
  request: NextRequest,
  context: { params: { kraftId: string } },
) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const kraftId = context?.params?.kraftId
    if (!kraftId) {
      return NextResponse.json({ message: 'missing kraftId' }, { status: 400 })
    }

    const payload = await request.json() as UpdateGuideDbPayload
    const res: AxiosResponse<UpdateGuideDbResponse> = await axios.patch(
      `${process.env.BACKEND_URI}/guides/db/${encodeURIComponent(kraftId)}`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

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
