import { CookieObject } from "@/shared/types/global.types";
import { ThemeMode } from "flowbite-react";

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

export const formatNumberToCurrency = (amount: number): string =>
  formatter.format(amount);

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
