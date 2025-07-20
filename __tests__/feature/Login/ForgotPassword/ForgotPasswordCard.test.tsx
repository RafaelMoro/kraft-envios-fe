import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/app/QueryProviderWrapper"
import { ForgotPasswordCard } from "@/features/Login/ForgotPassword/ForgotPasswordCard"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"
import { LOGIN_ROUTE } from "@/shared/constants/global.constants";

const ForgotPasswordCardWrapper = ({
  push,
  toggleNotification,
  updateNotificationMessage,
}: {
  push: () => void
  toggleNotification: () => void
  updateNotificationMessage: (message: string) => void
}) => {
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <ForgotPasswordCard toggleNotification={toggleNotification} updateNotificationMessage={updateNotificationMessage} />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ForgotPasswordCard', () => {
  it('Show Login Card', () => {
    const toggleNotification = jest.fn()
    const updateNotificationMessage = jest.fn()
    const push = jest.fn()

    render(
    <ForgotPasswordCardWrapper
      push={push}
      toggleNotification={toggleNotification}
      updateNotificationMessage={updateNotificationMessage}
    />)

    expect(screen.getByText(/escribe tu correo electrónico y te enviaremos los pasos para restablecer tu contraseña al instante\./i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  describe('Form validation', () => {
    beforeEach(() => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()

      render(
      <ForgotPasswordCardWrapper
        push={push}
        toggleNotification={toggleNotification}
        updateNotificationMessage={updateNotificationMessage}
      />)
    })

    it('Given the email being empty, show an error to the user', async () => {
      const user = userEvent.setup()

      const signInButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(signInButton)
      expect(await screen.findByText(/Por favor, ingrese su correo electrónico/i)).toBeInTheDocument()
    })

    it('Given a user filling the email wrong, show invalid email error ', async () => {
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a')
      const signInButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(signInButton)
      expect(await screen.findByText(/Correo electrónico inválido/i))
    })
  })

  describe('Form submission', () => {
    it('Given a user entering his email correctly, redirect to dashboard', async () => {
      const toggleNotification = jest.fn()
      const updateNotificationMessage = jest.fn()
      const push = jest.fn()
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: 'Email sent',
        success: true,
        version: "v1.2.0",
        data: null,
      })

      render(
        <ForgotPasswordCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(signInButton)
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(LOGIN_ROUTE)
      }, { timeout: 2000 })
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
          config: null,
          data: {
            data: null,
            error: {
              error: 'Bad Request',
              message: 'Something went wrong.',
              statusCode: 403
            },
            message: null,
            success: false,
            version: '1.2.0'
          }
        }
      })

      render(
        <ForgotPasswordCardWrapper
          push={push}
          toggleNotification={toggleNotification}
          updateNotificationMessage={updateNotificationMessage}
        />
      )

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      await user.type(emailInput, 'correo-electronico@a.com')
      const signInButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(signInButton)
      expect(toggleNotification).toHaveBeenCalled()
      expect(updateNotificationMessage).toHaveBeenCalledWith('Oops! Algo no salió como esperabamos.')
    })
  })
})