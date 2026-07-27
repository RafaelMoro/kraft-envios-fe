import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import HomePage from '../src/app/login/page'
import { getAccessToken, getUserInfo } from '../src/shared/lib/auth.lib'
import { LoginData } from '../src/shared/types/login.types'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn()
}))
jest.mock('../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn(),
  getUserInfo: jest.fn()
}))

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>
const mockedGetUserInfo = getUserInfo as jest.MockedFunction<typeof getUserInfo>

const adminUserInfo: LoginData = {
  data: { user: { email: 'admin@kraft.test', name: 'Admin', lastName: 'User', role: ['admin'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const nonAdminUserInfo: LoginData = {
  data: { user: { email: 'user@kraft.test', name: 'Regular', lastName: 'User', role: ['user'] } },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const Home = async ({
  push,
  searchParams
}: {
  push: () => void
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const Page = await HomePage({ searchParams })
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        {Page}
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetAccessToken.mockResolvedValue('')
  })

  it('Show the login page', async () => {
    const push = jest.fn()
    render(await Home({ push }))

    expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument()
    expect(screen.getByText(/ingrese sus credenciales para entrar a su cuenta\./i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('redirects an authenticated admin to the sanitized redirect param', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: '/dashboard/requests/abc' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard/requests/abc')
  })

  it('redirects an authenticated non-admin to /dashboard even with a valid redirect param', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(nonAdminUserInfo)
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: '/dashboard/requests/abc' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects an authenticated visitor with a missing/unparseable user-info cookie to /dashboard', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(null)
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: '/dashboard/requests/abc' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects an authenticated admin to /dashboard when the redirect param is hostile', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    mockedGetUserInfo.mockResolvedValue(adminUserInfo)
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: 'https://evil.com' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard')
  })
})
