import { sanitizeDashboardReturnUrl } from '@/shared/utils/global.utils'

describe('sanitizeDashboardReturnUrl', () => {
  it.each([
    ['/dashboard', '/dashboard'],
    ['/dashboard/requests/abc123', '/dashboard/requests/abc123']
  ])('Given the same-origin dashboard path %s, Then it is accepted as-is', (input, expected) => {
    expect(sanitizeDashboardReturnUrl(input)).toBe(expected)
  })

  it.each([
    [undefined],
    [null],
    [''],
    [['/dashboard', '/dashboard/other']],
    ['//evil.com'],
    ['https://evil.com'],
    ['/\\evil.com'],
    ['javascript:alert(1)'],
    ['evil.com'],
    ['/register']
  ])('Given the unsafe or non-dashboard value %p, Then it falls back to /dashboard', (input) => {
    expect(sanitizeDashboardReturnUrl(input)).toBe('/dashboard')
  })
})
