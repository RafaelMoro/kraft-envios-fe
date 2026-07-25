import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { LoginCard } from "@/features/Login/LoginCard"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock";
import { DASHBOARD_ROUTE } from "@/shared/constants/global.constants";

const LoginCardWrapper = ({
  push,
  toggleNotification,
  updateNotificationMessage,
  returnUrl,
}: {
  push: () => void
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
  returnUrl?: string
}) => {
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <LoginCard
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
          returnUrl={returnUrl}
        />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LoginCard', () => {
  it('Show Login Card', () => {
    const toggleNotification = jest.fn()
    const updateNotificationMessage = jest.fn()
    const push = jest.fn()

    render(
    <LoginCardWrapper
      push={push}
      toggleNotification={toggleNotification}
      updateNotificationMessage={updateNotificationMessage}
    />)

    expect(screen.getByRole('heading', { name: /ingrese sus credenciales para entrar a su cuenta\./i })).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByText(/¿Olvidaste tu contraseña\?/i)).toBeInTheDocument()
    expect(screen.getByText(/registrarse/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  describe('Form validation', () => {
    beforeEach(() => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()

      render(
      <LoginCardWrapper
        push={push}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
      />)
    })
    it('Given the email being empty, show an error to the user', async () => {
      const user = userEvent.setup()

      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      expect(await screen.findByText(/Por favor, ingrese su correo electrónico/i)).toBeInTheDocument()
    })

    it('Given a user filling the email wrong, show invalid email error ', async () => {
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      expect(await screen.findByText(/Correo electrónico inválido/i))
    })

    it('Given a user leaving the password empty, show password required error', async () => {
      const user = userEvent.setup()
    
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      expect(await screen.findByText(/Por favor, ingrese su contraseña/i))
    })
  })

  describe('Form submission', () => {
    it('Given a user entering email or password correctly, redirect to dashboard', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: null,
        success: true,
        version: "v1.2.0",
        data: {
          user: {
            _id: "some-id",
            email: "a-new-usero@mail.com",
            firstName: "john",
            lastName: "Doe",
          }
        }
      })

      render(
        <LoginCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const pwdInput = screen.getByLabelText(/contraseña/i)
      await user.type(pwdInput, '123')
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(DASHBOARD_ROUTE)
      }, { timeout: 2000 })
    })

    it('Given a sanitized returnUrl, redirect to it after a successful login', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: null,
        success: true,
        version: "v1.2.0",
        data: {
          user: {
            _id: "some-id",
            email: "a-new-usero@mail.com",
            firstName: "john",
            lastName: "Doe",
          }
        }
      })

      render(
        <LoginCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
          returnUrl="/dashboard/requests/abc"
        />
      )

      const pwdInput = screen.getByLabelText(/contraseña/i)
      await user.type(pwdInput, '123')
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith('/dashboard/requests/abc')
      }, { timeout: 2000 })
    })

    it('Given a hostile returnUrl, redirect to the dashboard instead', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: null,
        success: true,
        version: "v1.2.0",
        data: {
          user: {
            _id: "some-id",
            email: "a-new-usero@mail.com",
            firstName: "john",
            lastName: "Doe",
          }
        }
      })

      render(
        <LoginCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
          returnUrl="https://evil.com"
        />
      )

      const pwdInput = screen.getByLabelText(/contraseña/i)
      await user.type(pwdInput, '123')
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(DASHBOARD_ROUTE)
      }, { timeout: 2000 })
    })

    it('Given a user entering wrong email or password, show error', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
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

      render(
        <LoginCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const pwdInput = screen.getByLabelText(/contraseña/i)
      await user.type(pwdInput, '123')
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      expect(toggleNotification).toHaveBeenCalled()
      expect(updateNotificationMessage).toHaveBeenCalledWith('Correo electronico o contraseña incorrecta.')
    })

    it('Given a user entering email or password, then something went wrong, show error', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
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
            message: 'something went wrong.'
          }
        }
      })

      render(
        <LoginCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const pwdInput = screen.getByLabelText(/contraseña/i)
      await user.type(pwdInput, '123')
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await user.click(signInButton)
      expect(toggleNotification).toHaveBeenCalled()
      expect(updateNotificationMessage).toHaveBeenCalledWith('Oops! Algo no salió como esperabamos.')
    })
  })
})