import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";
import { GetProductId, GetProductSatIdPayload } from "@/shared/types/guides.types";
import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const satUri = process.env.GET_SAT_PRODUCT_URI
    if (!satUri) {
      return NextResponse.json({ message: 'missing SAT products URI' }, { status: 400 })
    }

    const payload: GetProductSatIdPayload = await request.json()
    const uri = `${satUri}?search=${payload.search}`
    const res: AxiosResponse<GetProductId> = await axios.get(uri)
    // TODO: Cut the response to the first 100
    console.log('res', res.data)
    return NextResponse.json({ data: res.data }, { status: 201 })
  } catch (error) {
    console.log('error')
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}