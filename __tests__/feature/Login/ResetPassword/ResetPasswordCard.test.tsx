import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from '@/features/QueryProviderWrapper';
import { ResetPasswordCard } from '@/features/Login/ResetPassword/ResetPasswordCard'


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ResetPasswordCard', () => {
  it('Show reset password card', () => {
    const mockToggleMessageCardState = jest.fn()
    const mockSlug = 'test-slug'
    render(
      <QueryProviderWrapper>
        <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
      </QueryProviderWrapper>
    )
    expect(screen.getByText(/ingresa y confirma tu nueva contraseña para recuperar el acceso\./i)).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reestablecer contraseña/i })).toBeInTheDocument()
  })

  describe('Form Validation', () => {
    it('Password fields are required', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.click(resetButton)
      expect(await screen.findByText(/Por favor, ingrese una contraseña/i)).toBeInTheDocument()
      expect(screen.getByText(/Por favor, ingrese su contraseña nuevamente/i)).toBeInTheDocument()
    })

    it('Given a user entering a short password, show error validation', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, '1234')
      await user.click(resetButton)
      expect(await screen.findByText(/La contraseña debe tener al menos 8 caracteres. Ingrese más caracteres/i)).toBeInTheDocument()
    })

    it('Given a user entering a password only lower case characters, show error validation to enter 1 upper case character', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpassword')
      await user.click(resetButton)
      expect(await screen.findByText(/La contraseña debe contener al menos 1 mayúscula/i)).toBeInTheDocument()
    })

    it('Given a user entering a password with at least 16 characters lower case and 1 upper case, show error validation to enter 1 number character', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpasswordA')
      await user.click(resetButton)
      expect(await screen.findByText(/La contraseña debe contener al menos 1 número/i)).toBeInTheDocument()
    })

    it('Given a user entering a password with at least 16 characters lower case, 1 upper case, 1 number, show error validation to enter 1 special character', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpasswordA1')
      await user.click(resetButton)
      expect(await screen.findByText(/La contraseña debe contener al menos 1 caracter especial/i)).toBeInTheDocument()
    })

    it('Given a user entering a strong password, then enters a confirm password different, show error validation', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const confirmPwdInput = screen.getByTestId('confirmPassword')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpasswordA1@')
      await user.type(confirmPwdInput, 'alotofcharactersonpasswordA2')
      await user.click(resetButton)
      expect(await screen.findByText(/Contraseña y confirmar contraseña deben ser iguales\./i)).toBeInTheDocument()
    })
  })

  describe('Reset Password submit', () => {
    it('Given a user password and confirm password, then something goes wrong', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
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
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const confirmPwdInput = screen.getByTestId('confirmPassword')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpasswordA1@')
      await user.type(confirmPwdInput, 'alotofcharactersonpasswordA1@')
      await user.click(resetButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled()
      })
    })

    it('Given a user password and confirm password, see tick in button', async () => {
      const user = userEvent.setup()
      const mockToggleMessageCardState = jest.fn()
      const mockSlug = 'test-slug'
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: 'Reset Password Successfully',
        success: true,
        version: "v1.2.0",
        data: null,
      })

      render(
        <QueryProviderWrapper>
          <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
        </QueryProviderWrapper>
      )

      const pwdInput = screen.getByTestId('password')
      const confirmPwdInput = screen.getByTestId('confirmPassword')
      const resetButton = screen.getByRole('button', { name: /reestablecer contraseña/i })
      await user.type(pwdInput, 'alotofcharactersonpasswordA1@')
      await user.type(confirmPwdInput, 'alotofcharactersonpasswordA1@')
      await user.click(resetButton)

      expect(await screen.findByTestId('check-icon')).toBeInTheDocument()
    })
  })
})