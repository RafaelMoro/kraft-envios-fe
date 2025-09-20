import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios";
import { FetchSatProductsResponse, GetProductId, GetProductSatIdPayload, SatProduct, SearchProduct } from "@/shared/types/guides.types";
import { GeneralError } from "@/shared/types/global.types";
import { replaceSpacesWithPlus } from "@/shared/utils/guides.utils";

export async function POST(request: NextRequest): Promise<NextResponse<FetchSatProductsResponse>> {
  try {
    const satUri = process.env.GET_SAT_PRODUCT_URI
    if (!satUri) {
      return NextResponse.json({ message: 'missing SAT products URI', products: [] }, { status: 400 })
    }

    const payload: GetProductSatIdPayload = await request.json()
    const uri = `${satUri}?search=${replaceSpacesWithPlus(payload.search)}`
    const res: AxiosResponse<GetProductId> = await axios.get(uri)

    // Slicing products to 100
    const products: SatProduct[] = res?.data?.data?.slice(0, 100) || []
    const formattedProducts: SearchProduct[] = products.map((prod) => ({
      code: prod.code,
      description: prod.description
    }))

    return NextResponse.json({ message: null, products: formattedProducts }, { status: 201 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message, products: [] }, { status: 400 })
  }
}