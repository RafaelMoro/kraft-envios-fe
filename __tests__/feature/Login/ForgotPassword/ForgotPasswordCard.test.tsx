import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from "@/app/QueryProviderWrapper"
import { ForgotPasswordCard } from "@/features/Login/ForgotPassword/ForgotPasswordCard"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"

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
})