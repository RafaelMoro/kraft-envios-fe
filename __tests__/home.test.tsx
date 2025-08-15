import { render, screen } from '@testing-library/react'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import HomePage from '../src/app/page'

const Home = async ({ push }: { push: () => void }) => {
  const Page = await HomePage()
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        {Page}
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

describe('Login page', () => {
  it('Show the login page', async () => {
    const push = jest.fn()
    render(await Home({ push }))

    expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument()
    expect(screen.getByText(/ingrese sus credenciales para entrar a su cuenta\./i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })
})