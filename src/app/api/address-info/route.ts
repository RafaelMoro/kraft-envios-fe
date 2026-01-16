import { getAccessToken } from "@/shared/lib/auth.lib";
import { GeneralError } from "@/shared/types/global.types";
import axios, { AxiosResponse } from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { message: "missing access token" },
        { status: 400 },
      );
    }
    const { searchParams } = new URL(request.url);
    const zipcode = searchParams.get("zipcode");
    if (!zipcode) {
      return NextResponse.json({ message: "missing zipcode" }, { status: 400 });
    }

    const uri = `${process.env.BACKEND_URI}/quotes/address-info/${zipcode}`;
    const res: AxiosResponse<unknown> = await axios.get(uri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error
      ?.message;
    return NextResponse.json({ message }, { status: 400 });
  }
}
