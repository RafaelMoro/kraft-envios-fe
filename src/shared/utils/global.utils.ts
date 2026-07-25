import { CookieObject } from "@/shared/types/global.types";
import { ThemeMode } from "flowbite-react";
import { DASHBOARD_ROUTE } from "@/shared/constants/global.constants";

/**
 * This function calls the API to save the theme in the cookie for client side components
 * @param theme - The theme mode to save
 * @returns Promise<void>
 */
export const saveThemeApi = async (theme: ThemeMode) => {
  try {
    const res = await fetch('/api/preferences/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    })
    return res
  } catch (error) {
    console.log('error while saving theme in api', error)
  }
}

export function getCookieProps(setCookieStr: string): CookieObject {
  const parts = setCookieStr.split(";").map(s => s.trim());
  const [nameValue] = parts;
  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.substring(0, eqIdx);
  const value = nameValue.substring(eqIdx + 1);

  return { name, value };
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export const formatNumberToCurrency = (amount: number | null): string => {
  if (!amount) return ''
  return formatter.format(amount);
}

export const createUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
};

/**
 * Format a 10-digit phone number string into `NNN NNN NNNN`.
 * If the input doesn't contain exactly 10 digits after stripping non-digits, returns the original input.
 * @example formatPhoneNumber('2213526425') => '221 352 6425'
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return phone
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  const part1 = digits.substring(0, 3)
  const part2 = digits.substring(3, 6)
  const part3 = digits.substring(6, 10)
  return `${part1}-${part2}-${part3}`
}

/**
 * Only same-origin dashboard paths survive as post-login destinations. Everything
 * else (protocol-relative, backslash-smuggled, scheme-bearing, or off-dashboard)
 * falls back to the dashboard, so `?redirect=` can never become an open redirect.
 */
export const sanitizeDashboardReturnUrl = (
  value: string | string[] | undefined | null
): string => {
  if (typeof value !== 'string') return DASHBOARD_ROUTE

  const candidate = value.trim()
  if (!candidate.startsWith('/')) return DASHBOARD_ROUTE
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return DASHBOARD_ROUTE
  if (/[a-z][a-z0-9+.-]*:/i.test(candidate)) return DASHBOARD_ROUTE
  if (candidate !== DASHBOARD_ROUTE && !candidate.startsWith(`${DASHBOARD_ROUTE}/`)) {
    return DASHBOARD_ROUTE
  }

  return candidate
}
