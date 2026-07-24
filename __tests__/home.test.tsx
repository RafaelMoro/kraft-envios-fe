import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import HomePage from '../src/app/page'
import { getAccessToken } from '../src/shared/lib/auth.lib'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn()
}))
jest.mock('../src/shared/lib/auth.lib', () => ({
  getAccessToken: jest.fn()
}))

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>

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

  it('redirects an authenticated visitor to the sanitized redirect param', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: '/dashboard/requests/abc' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard/requests/abc')
  })

  it('redirects an authenticated visitor to /dashboard when the redirect param is hostile', async () => {
    mockedGetAccessToken.mockResolvedValue('token-123')
    const push = jest.fn()

    await Home({ push, searchParams: { redirect: 'https://evil.com' } })

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard')
  })
})