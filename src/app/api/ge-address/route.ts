import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib"
import { CreateAddressGEPayload, CreateAddressGEResponse, DeleteGEAdressResponse, GetAliasAddressesGEResponse } from "@/shared/types/guides.types"
import { GeneralError } from "@/shared/types/global.types";

export async function GET(request: Request) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const { searchParams } = new URL(request.url)
    const aliasesOnly = searchParams.get('aliasesOnly')
    
    let uri = `${process.env.BACKEND_URI}/ge/addresses`
    if (aliasesOnly !== null) {
      uri += `?aliasesOnly=${aliasesOnly}`
    }
    
    const res: AxiosResponse<GetAliasAddressesGEResponse> = await axios.get(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = res?.data?.data
    return NextResponse.json({ aliases: data?.aliases, addresses: data?.addresses }, { status: 200 })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }
  
    const payload: CreateAddressGEPayload = await request.json()
    const uri = `${process.env.BACKEND_URI}/ge/address`
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.post(uri, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return NextResponse.json(res.data, { status: 201 })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return NextResponse.json({ message: 'missing access token' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('addressId')
    if (!addressId) {
      return NextResponse.json({ message: 'missing addressId' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/ge/address/${addressId}`
    const res: AxiosResponse<DeleteGEAdressResponse> = await axios.delete(uri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = res?.data
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.error?.message || error.message
      return NextResponse.json({ message }, { status: 400 })
    }
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
  
    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('addressId')
    const currentAlias = searchParams.get('currentAlias')
    if (!addressId) {
      return NextResponse.json({ message: 'missing addressId' }, { status: 400 })
    }
    if (!currentAlias) {
      return NextResponse.json({ message: 'missing currentAlias' }, { status: 400 })
    }

    const payload: CreateAddressGEPayload = await request.json()
    if (payload.alias !== currentAlias) {
      return NextResponse.json({ message: 'Alias cannot be edited' }, { status: 400 })
    }

    const uri = `${process.env.BACKEND_URI}/ge/address/${addressId}`
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.put(uri, payload, {
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