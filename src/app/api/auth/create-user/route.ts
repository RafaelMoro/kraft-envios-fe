import axios from "axios";
import { type NextRequest, NextResponse } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const uri = `${process.env.BACKEND_URI}/users`
    const res = await axios.post(uri, payload)
    
    return NextResponse.json({ data: res.data }, { status: 200 })
  } catch (error) {
    console.error('Error creating user:', error);
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return NextResponse.json({ message }, { status: 400 })
  }
}