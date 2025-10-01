import { render, screen } from '@testing-library/react'
import { ParcelInfoForm } from '@/features/Guides/ParcelInfoForm'
import { ParcelInfoFormValues } from '@/shared/types/guides.types'

// Mock functions for props
const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockUpdateParcelInfo = jest.fn()
const mockUpdateErrorProductSat = jest.fn()

const defaultParcelInfo: ParcelInfoFormValues = {
  content: '',
  value: 0,
  quantity: 0
}

const defaultProps = {
  children: null,
  isMobileTablet: false,
  parcelInfo: defaultParcelInfo,
  searchProductSat: 'Ropa deportiva',
  goNext: mockGoNext,
  goPrev: mockGoPrev,
  updateParcelInfo: mockUpdateParcelInfo,
  updateErrorProductSat: mockUpdateErrorProductSat
}

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(<ParcelInfoForm {...mergedProps} />)
}

describe('ParcelInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial component rendering', () => {
    it('should display form fields with correct labels and buttons when component loads', () => {
      // Given the ParcelInfoForm is rendered with initial props
      renderComponent()

      // Then form fields should be displayed with correct labels
      expect(screen.getByText('Contenido del paquete')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveValue('')

      expect(screen.getByText('Valor del paquete')).toBeInTheDocument()
      expect(screen.getByTestId('value')).toBeInTheDocument()
      expect(screen.getByTestId('value')).toHaveValue(0)

      expect(screen.getByText('Cantidad')).toBeInTheDocument()
      expect(screen.getByTestId('quantity')).toBeInTheDocument()
      expect(screen.getByTestId('quantity')).toHaveValue(0)

      // Then buttons should be present
      expect(screen.getByTestId('parcel-info-form-cancel-button')).toBeInTheDocument()
      expect(screen.getByText('Regresar')).toBeInTheDocument()
      
      expect(screen.getByTestId('parcel-info-form-next-button')).toBeInTheDocument()
      expect(screen.getByText('Siguiente')).toBeInTheDocument()

      // Then form should be rendered
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should not display mobile title when isMobileTablet is false', () => {
      // Given the ParcelInfoForm is rendered with isMobileTablet false
      renderComponent({ isMobileTablet: false })

      // Then mobile title should not be displayed
      expect(screen.queryByText('Información del paquete')).not.toBeInTheDocument()
    })

    it('should have correct input types for form fields', () => {
      // Given the ParcelInfoForm is rendered
      renderComponent()

      // Then content field should be text type
      expect(screen.getByTestId('content')).toHaveAttribute('type', 'text')

      // Then value field should be number type
      expect(screen.getByTestId('value')).toHaveAttribute('type', 'number')

      // Then quantity field should be number type
      expect(screen.getByTestId('quantity')).toHaveAttribute('type', 'number')
    })

    it('should have form element with proper structure', () => {
      // Given the ParcelInfoForm is rendered
      renderComponent()

      // Then form should contain all required elements
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()

      // Verify form contains the input fields
      expect(form).toContainElement(screen.getByTestId('content'))
      expect(form).toContainElement(screen.getByTestId('value'))
      expect(form).toContainElement(screen.getByTestId('quantity'))

      // Verify form contains the buttons
      expect(form).toContainElement(screen.getByTestId('parcel-info-form-cancel-button'))
      expect(form).toContainElement(screen.getByTestId('parcel-info-form-next-button'))
    })
  })
})
