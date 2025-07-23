import { CompanyDetails } from "@/features/Login/Register/CompanyDetails"
import { CompanyDetailsForm } from "@/shared/types/login.types"
import { AppRouterContextProviderMock } from "@/shared/ui/organisms/AppRouterContextProviderMock"
import { render, screen } from "@testing-library/react"

const CompanyDetailsWrapper = ({
  goNext,
  goPrev,
  updateCompanyDetails,
  companyDetails = null
}: {
  goNext: () => void
  goPrev: () => void
  updateCompanyDetails: (data: CompanyDetailsForm) => void
  companyDetails?: CompanyDetailsForm | null
}) => {
  const currentCompanyDetails = companyDetails ?? {
    companyName: '',
    address: '',
    postalCode: ''
  }
  const push = jest.fn()
  return (
    <AppRouterContextProviderMock router={{ push }}>
      <CompanyDetails
        goNext={goNext}
        goPrev={goPrev}
        updateCompanyDetails={updateCompanyDetails}
        companyDetails={currentCompanyDetails}
      />
    </AppRouterContextProviderMock>
  )
}

describe('CompanyDetails', () => {
  it('Show company details form', () => {
    const goNext = jest.fn()
    const goPrev = jest.fn()
    const updateCompanyDetails = jest.fn()

    render(<CompanyDetailsWrapper
      goNext={goNext}
      goPrev={goPrev}
      updateCompanyDetails={updateCompanyDetails}
    />)

    expect(screen.getByText('Cuéntanos el nombre de tu compañía, su dirección y el código postal para empezar a trabajar juntos.')).toBeInTheDocument()
  })
})