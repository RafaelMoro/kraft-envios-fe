import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";
import { GetProductId, GetProductSatIdPayload, SatProduct, SearchProduct } from "@/shared/types/guides.types";
import { GeneralError } from "@/shared/types/global.types";
import { replaceSpacesWithPlus } from "@/shared/utils/guides.utils";

export async function POST(request: NextRequest): Promise<NextResponse<unknown>> {
  try {
    const {
      NEXT_PUBLIC_GET_SAT_PRODUCT_URI: satUri
    } = process.env
    if (!satUri) {
      return NextResponse.json({ message: 'missing SAT products URI', products: [] }, { status: 400 })
    }

    const payload: GetProductSatIdPayload = await request.json()
    const uri = `${satUri}?search=${replaceSpacesWithPlus(payload.search)}`
    console.warn('uri', uri)
    const res: AxiosResponse<GetProductId> = await axios.get(uri)
    console.warn('data', res.data)

    // Slicing products to 100
    const products: SatProduct[] = res?.data?.data?.slice(0, 100) || []
    const formattedProducts: SearchProduct[] = products.map((prod) => ({
      code: prod.code,
      description: prod.description
    }))

    return NextResponse.json({ message: { uri, data: res.data }, products: formattedProducts }, { status: 201 })
  } catch (error) {
    console.error('Error fetching SAT products:', error)
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message: { error, message }, products: [] }, { status: 404 })
  }
}