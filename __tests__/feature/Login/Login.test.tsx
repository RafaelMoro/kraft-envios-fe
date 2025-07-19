import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/app/QueryProviderWrapper"
import { Login } from "@/features/Login/Login"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"

const LoginWrapper = ({
  push
}: {
  push: () => void
}) => {
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <Login />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login component', () => {
  it('Given a user entering credentials wrong, then show error', async () => {
    const push = jest.fn()
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValue({
      code: 'ERR_BAD_REQUEST',
      config: null,
      message: 'Request failed with status code 401',
      name: 'AxiosError',
      request: null,
      response: {
        data: {
          message: 'Email or Password incorrect.'
        }
      }
    })

    render(<LoginWrapper push={push} />)

    const pwdInput = screen.getByLabelText(/contraseña/i)
    await user.type(pwdInput, '123')
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    await user.type(emailInput, 'correo-electronico@a.com')
    const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(signInButton)

    expect(screen.getByText('Correo electronico o contraseña incorrecta.')).toBeInTheDocument()
  })
})