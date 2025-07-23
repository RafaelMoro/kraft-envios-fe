import axios from 'axios';
import userEvent from '@testing-library/user-event'
import { render, screen } from "@testing-library/react";

import { QueryProviderWrapper } from '@/app/QueryProviderWrapper';
import { Register } from '@/features/Login/Register/Register';
import { SUCCESS_CREATE_USER_MESSAGE, SUCCESS_CREATE_USER_TITLE } from '@/shared/constants/login.constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Register', () => {
  it('should show the result screen after successfully creating a user', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({
      error: null,
      message: null,
      success: true,
      version: "v1.2.0",
      data: {
        userCreated: {
          email: "rafa10@mail.com",
          sub: "6844b5aa39dceaf18bde61a2"
        }
      }
    })

    render(
      <QueryProviderWrapper>
        <Register />
      </QueryProviderWrapper>
    )

    const firstNameInput = screen.getByTestId('firstName')
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const phoneInput = screen.getByTestId('phone')
    const nextButton = screen.getByTestId('personal-information-next-button')

    await user.type(firstNameInput, 'John')
    await user.type(phoneInput, '1234567891')
    await user.type(lastNameInput, 'Doe')
    await user.click(nextButton)

    const postalCodeInput = screen.getByLabelText(/código postal/i)
    const nextButton2 = screen.getByTestId('company-details-next-button')
    await user.type(postalCodeInput, '1234')
    await user.click(nextButton2)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByTestId('password')
    const confirmPasswordInput = screen.getByTestId('confirmPassword')
    const createAccountButton = screen.getByRole('button', { name: /crear cuenta/i })

    await user.type(emailInput, 'rafa@example.com')
    await user.type(passwordInput, 'UnaContrase;amuylargaparaminuevacuenta!1')
    await user.type(confirmPasswordInput, 'UnaContrase;amuylargaparaminuevacuenta!1')
    await user.click(createAccountButton)

    expect(await screen.findByText(SUCCESS_CREATE_USER_TITLE)).toBeInTheDocument()
    expect(screen.getByText(SUCCESS_CREATE_USER_MESSAGE)).toBeInTheDocument()
    const goBackLogin = screen.getByRole('link', { name: /regresar al inicio/i })
    expect(goBackLogin).toBeInTheDocument()
  })
})