
import { COOKIE_SESSION_KEY, COOKIE_USER_INFO_KEY, DASHBOARD_ROUTE, LOGIN_ROUTE } from "@/shared/constants/global.constants";
import { signOut } from "@/shared/lib/auth.lib";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  await signOut();
  
  // Invalidate cached pages that depend on auth state
  revalidatePath(LOGIN_ROUTE);
  revalidatePath(DASHBOARD_ROUTE);
  
  const response = NextResponse.json({ message: "Signed out successfully" });
  
  // Ensure cookies are deleted on the response as well (defense in depth)
  response.cookies.delete(COOKIE_SESSION_KEY)
  response.cookies.delete(COOKIE_USER_INFO_KEY)
  
  return response;
}