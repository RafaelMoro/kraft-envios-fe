import axios from "axios";
import { type NextRequest } from 'next/server'

import { GeneralError } from "@/shared/types/global.types";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const uri = `${process.env.BACKEND_URI}/users/reset-password/${payload.slug}`
    const res = await axios.post(uri, payload.data)
    
    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error reset password:', error);
    const message = (error as unknown as GeneralError)?.response?.data?.error?.message
    return new Response(JSON.stringify({ error: { message } }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}