import { render, screen } from "@testing-library/react"

import { PersonalInformation } from "@/features/Login/Register/PersonalInformation"
import { PersonalInformationForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"

const PersonalInformationWrapper = ({
  goNext,
  updatePersonalInformation,
  personalInformation = null
}: {
  goNext: () => void
  updatePersonalInformation: (data: PersonalInformationForm) => void
  personalInformation?: PersonalInformationForm | null
}) => {
  const currentPersonalInformation = personalInformation ?? {
    name: "",
    lastName: "",
    phone: ""
  }
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <PersonalInformation
        goNext={goNext}
        updatePersonalInformation={updatePersonalInformation}
        personalInformation={currentPersonalInformation}
      />
    </AppRouterContextProviderMock>
  )
}

describe('PersonalInformation', () => {
  it('Show personal information form', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    expect(screen.getByTestId('firstName')).toBeInTheDocument()
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByTestId('phone')).toBeInTheDocument()
  })
})