import { render, screen } from "@testing-library/react"

import { QueryProviderWrapper } from "@/app/QueryProviderWrapper"
import { LoginCard } from "@/features/Login/LoginCard"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"

const LoginCardWrapper = ({
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
        <LoginCard toggleNotification={toggleNotification} updateNotificationMessage={updateNotificationMessage} />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

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
  })
})