import { render, screen } from "@testing-library/react"
import { UserRegistration } from "@/features/Login/Register/UserRegistration"
import { UserPasswordForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"

const UserRegistrationWrapper = ({
  isLoading,
  goPrev,
  submitForm,
  updateUserPasswordInfo
}: {
  isLoading: boolean
  goPrev: () => void
  submitForm: () => void
  updateUserPasswordInfo: (data: UserPasswordForm) => void
}) => {
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <UserRegistration
        isLoading={isLoading}
        goPrev={goPrev}
        submitForm={submitForm}
        updateUserPasswordInfo={updateUserPasswordInfo}
      />
    </AppRouterContextProviderMock>
  )
}

describe('UserRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Show user registration form', () => {
    const mockGoPrev = jest.fn()
    const mockSubmitForm = jest.fn()
    const mockUpdateUserPasswordInfo = jest.fn()
    render(<UserRegistrationWrapper 
      isLoading={false}
      goPrev={mockGoPrev} 
      submitForm={mockSubmitForm}
      updateUserPasswordInfo={mockUpdateUserPasswordInfo} 
    />)

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument()
  })
})