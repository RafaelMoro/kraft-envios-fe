import { render, screen } from "@testing-library/react"

import { PersonalInformation } from "@/features/Login/Register/PersonalInformation"
import { PersonalInformationForm } from "@/shared/types/login.types"

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
  return (
    <PersonalInformation
      goNext={goNext}
      updatePersonalInformation={updatePersonalInformation}
      personalInformation={currentPersonalInformation}
    />
  )
}

describe('PersonalInformation', () => {
  it('Show personal information form', () => {
    const mockGoNext = jest.fn()
    const mockUpdatePersonalInformation = jest.fn()
    render(<PersonalInformationWrapper goNext={mockGoNext} updatePersonalInformation={mockUpdatePersonalInformation} />)

    expect(screen.getByTestId('firstName')).toBeInTheDocument()
    expect(screen.getByTestId('lastName')).toBeInTheDocument()
    expect(screen.getByTestId('phone')).toBeInTheDocument()
  })
})