import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";

import { getAccessToken } from "@/shared/lib/auth.lib";
import { GeneralError } from "@/shared/types/global.types";
import {
  GetAddressInfoResponse,
  Neighborhood,
} from "@/shared/types/quotes.types";

export async function GET(
  request: Request,
): Promise<
  NextResponse<{ neighborhoods: Neighborhood[]; message: string | null }>
> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { neighborhoods: [], message: "missing access token" },
        { status: 400 },
      );
    }
    const { searchParams } = new URL(request.url);
    const zipcode = searchParams.get("zipcode");
    if (!zipcode) {
      return NextResponse.json(
        { neighborhoods: [], message: "missing zipcode" },
        { status: 400 },
      );
    }

    const uri = `${process.env.BACKEND_URI}/quotes/address-info/${zipcode}`;
    const res: AxiosResponse<GetAddressInfoResponse> = await axios.get(uri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = res?.data?.data?.neighborhoods;
    return NextResponse.json(
      { neighborhoods: data, message: null },
      { status: 200 },
    );
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error
      ?.message;
    return NextResponse.json({ neighborhoods: [], message }, { status: 400 });
  }
}
