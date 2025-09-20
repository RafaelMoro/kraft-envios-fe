import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";
import { GetProductId, GetProductSatIdPayload } from "@/shared/types/guides.types";
import { GeneralError } from "@/shared/types/global.types";
import { replaceSpacesWithPlus } from "@/shared/utils/guides.utils";

export async function POST(request: NextRequest) {
  try {
    const satUri = process.env.GET_SAT_PRODUCT_URI
    if (!satUri) {
      return NextResponse.json({ message: 'missing SAT products URI' }, { status: 400 })
    }

    const payload: GetProductSatIdPayload = await request.json()
    const uri = `${satUri}?search=${replaceSpacesWithPlus(payload.search)}`
    const res: AxiosResponse<GetProductId> = await axios.get(uri)
    // Slicing products to 100
    const products = res?.data?.data?.slice(0, 100) || []
    return NextResponse.json(products, { status: 201 })
  } catch (error) {
    console.log('error', error)
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}