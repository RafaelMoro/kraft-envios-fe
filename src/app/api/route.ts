import axios, { AxiosResponse } from "axios";
import { type NextRequest, NextResponse } from 'next/server'

import { getCookieProps } from "@/shared/utils/global.utils";
import { encodeAccessToken, saveSessionCookie, saveUserInfo } from "@/shared/lib/auth.lib";
import { GeneralError } from "@/shared/types/global.types";
import { COOKIE_SESSION_KEY, COOKIE_USER_INFO_KEY } from "@/shared/constants/global.constants";
import { LoginData } from "@/shared/types/login.types";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const uri = `${process.env.BACKEND_URI}/auth/`
    const res: AxiosResponse<LoginData> = await axios.post(uri, payload)
    const userData = res?.data
    const cookiesReceived = res.headers['set-cookie']

    if (cookiesReceived) {
      const [cookie] = cookiesReceived
      const { value: cookieValue } = getCookieProps(cookie)
      const session = await encodeAccessToken(cookieValue)
      await saveSessionCookie(session)
      await saveUserInfo(userData)
      
      const response = NextResponse.json({ data: res.data }, { status: 201 })
      response.cookies.set(COOKIE_SESSION_KEY, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 5 // 5 days
      });
      response.cookies.set(COOKIE_USER_INFO_KEY, JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 5 // 5 days
      });
      return response
    }

    return NextResponse.json({ message: 'missing cookie' }, { status: 400 })
  } catch (error) {
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}