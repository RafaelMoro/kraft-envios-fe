import { render, screen } from '@testing-library/react'
import { QueryProviderWrapper } from "@/app/QueryProviderWrapper"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"
import HomePage from '../src/app/page'

const Home = ({ push }: { push: () => void }) => {
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <HomePage />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

describe('Login page', () => {
  it('Show the login page', () => {
    const push = jest.fn()
    render(<Home push={push} />)

    expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument()
  })
})