import axios, { AxiosResponse } from "axios";
import { type NextRequest, NextResponse } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";
import { getAccessToken } from "@/shared/lib/auth.lib";
import {
  AddressAliasResponse,
  CreateAddressPayload,
  CreateAddressResponse,
  DeleteAddressPayload,
  GetAddressesResponse
} from "@/shared/types/addresses.types";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateAddressPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/addresses`
    const res: AxiosResponse<CreateAddressResponse> = await axios.post(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(res.data, { status: 201 })

  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
    const uri = `${process.env.BACKEND_URI}/addresses`
    const res: AxiosResponse<GetAddressesResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return NextResponse.json(res.data, { status: 200 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const payload: DeleteAddressPayload = await request.json()
    const payloadEncoded = encodeURIComponent(payload.alias)
    const uri = `${process.env.BACKEND_URI}/addresses/${payloadEncoded}`
    const res: AxiosResponse<AddressAliasResponse> = await axios.delete(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return NextResponse.json(res.data, { status: 200 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateAddressPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/addresses`
    const res: AxiosResponse<AddressAliasResponse> = await axios.put(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(res.data, { status: 201 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}