import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  describe('Form validation errors', () => {
    it('should display validation error when content field is empty and form is submitted', async () => {
      // Given the ParcelInfoForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user submits form without entering content
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then content validation error should be displayed
      await waitFor(() => {
        expect(screen.getByText('Contenido es requerido')).toBeInTheDocument()
      })
    })

    it('should display validation error when content field has less than 2 characters', async () => {
      // Given the ParcelInfoForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters only 1 character in content field and submits
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'a')
      
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then content validation error should be displayed
      await waitFor(() => {
        expect(screen.getByText('El contenido debe tener al menos 2 caracteres')).toBeInTheDocument()
      })
    })

    it('should display validation error when value field is 0 and form is submitted', async () => {
      // Given the ParcelInfoForm is rendered with valid content
      const user = userEvent.setup()
      renderComponent()

      // When user enters valid content but leaves value as 0 and submits
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'Valid content')
      
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then value validation error should be displayed
      await waitFor(() => {
        expect(screen.getByText('El valor debe ser al menos 1')).toBeInTheDocument()
      })
    })

    it('should display validation error when quantity field is 0 and form is submitted', async () => {
      // Given the ParcelInfoForm is rendered with valid content and value
      const user = userEvent.setup()
      renderComponent()

      // When user enters valid content and value but leaves quantity as 0 and submits
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'Valid content')
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '100')
      
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then quantity validation error should be displayed
      await waitFor(() => {
        expect(screen.getByText('La cantidad debe ser al menos 1')).toBeInTheDocument()
      })
    })

    it('should display multiple validation errors when multiple fields are invalid', async () => {
      // Given the ParcelInfoForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user submits form with all invalid data
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'a') // Less than 2 characters
      
      // Value and quantity remain 0 (invalid)
      
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then all validation errors should be displayed
      await waitFor(() => {
        expect(screen.getByText('El contenido debe tener al menos 2 caracteres')).toBeInTheDocument()
        expect(screen.getByText('El valor debe ser al menos 1')).toBeInTheDocument()
        expect(screen.getByText('La cantidad debe ser al menos 1')).toBeInTheDocument()
      })
    })

    it('should not display validation errors when all fields are valid', async () => {
      // Given the ParcelInfoForm is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user enters valid data in all fields
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'Valid content')
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '100')
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '2')
      
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then no validation errors should be displayed
      expect(screen.queryByText('Contenido es requerido')).not.toBeInTheDocument()
      expect(screen.queryByText('El contenido debe tener al menos 2 caracteres')).not.toBeInTheDocument()
      expect(screen.queryByText('El valor debe ser al menos 1')).not.toBeInTheDocument()
      expect(screen.queryByText('La cantidad debe ser al menos 1')).not.toBeInTheDocument()

      // And form submission functions should be called
      expect(mockUpdateParcelInfo).toHaveBeenCalledWith({
        content: 'Valid content',
        value: 100,
        quantity: 2
      })
      expect(mockGoNext).toHaveBeenCalled()
    })

    it('should clear validation errors when user corrects invalid fields', async () => {
      // Given the ParcelInfoForm is rendered and has validation errors
      const user = userEvent.setup()
      renderComponent()

      // First, trigger validation errors
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Contenido es requerido')).toBeInTheDocument()
      })

      // When user enters valid content
      const contentInput = screen.getByTestId('content')
      await user.type(contentInput, 'Valid content')
      
      // And submits again
      await user.click(submitButton)

      // Then content validation error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Contenido es requerido')).not.toBeInTheDocument()
        expect(screen.queryByText('El contenido debe tener al menos 2 caracteres')).not.toBeInTheDocument()
      })
    })
  })

  describe('Valid form submission', () => {
    it('should call updateParcelInfo and goNext when form is submitted with valid data and searchProductSat exists', async () => {
      // Given the ParcelInfoForm is rendered with valid searchProductSat
      const user = userEvent.setup()
      renderComponent({ searchProductSat: 'Ropa deportiva' })

      // When user enters valid data in all fields
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'Camiseta deportiva')
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '250')
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '3')
      
      // And submits the form
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then updateParcelInfo should be called with the correct data
      await waitFor(() => {
        expect(mockUpdateParcelInfo).toHaveBeenCalledWith({
          content: 'Camiseta deportiva',
          value: 250,
          quantity: 3
        })
      })

      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)

      // And updateErrorProductSat should not be called
      expect(mockUpdateErrorProductSat).not.toHaveBeenCalled()
    })

    it('should handle form submission with minimum valid values', async () => {
      // Given the ParcelInfoForm is rendered with valid searchProductSat
      const user = userEvent.setup()
      renderComponent({ searchProductSat: 'Producto válido' })

      // When user enters minimum valid data
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'AB') // Minimum 2 characters
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '1') // Minimum value 1
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '1') // Minimum quantity 1
      
      // And submits the form
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then updateParcelInfo should be called with the minimum valid data
      await waitFor(() => {
        expect(mockUpdateParcelInfo).toHaveBeenCalledWith({
          content: 'AB',
          value: 1,
          quantity: 1
        })
      })

      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission with large numeric values', async () => {
      // Given the ParcelInfoForm is rendered with valid searchProductSat
      const user = userEvent.setup()
      renderComponent({ searchProductSat: 'Producto caro' })

      // When user enters large numeric values
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, 'Producto de alto valor')
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '99999')
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '100')
      
      // And submits the form
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then updateParcelInfo should be called with the large values
      await waitFor(() => {
        expect(mockUpdateParcelInfo).toHaveBeenCalledWith({
          content: 'Producto de alto valor',
          value: 99999,
          quantity: 100
        })
      })

      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission with long content text', async () => {
      // Given the ParcelInfoForm is rendered with valid searchProductSat
      const user = userEvent.setup()
      renderComponent({ searchProductSat: 'Producto con descripción larga' })

      // When user enters long content text
      const longContent = 'Este es un contenido muy largo que describe detalladamente el producto que se está enviando, incluyendo todas sus características y especificaciones técnicas importantes'
      
      const contentInput = screen.getByTestId('content')
      await user.clear(contentInput)
      await user.type(contentInput, longContent)
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '500')
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '2')
      
      // And submits the form
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then updateParcelInfo should be called with the long content
      await waitFor(() => {
        expect(mockUpdateParcelInfo).toHaveBeenCalledWith({
          content: longContent,
          value: 500,
          quantity: 2
        })
      })

      // And goNext should be called
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('should prevent default form submission behavior', async () => {
      // Given the ParcelInfoForm is rendered with valid searchProductSat
      const user = userEvent.setup()
      renderComponent({ searchProductSat: 'Producto válido' })

      // When user enters valid data and submits
      const contentInput = screen.getByTestId('content')
      await user.type(contentInput, 'Contenido válido')
      
      const valueInput = screen.getByTestId('value')
      await user.clear(valueInput)
      await user.type(valueInput, '100')
      
      const quantityInput = screen.getByTestId('quantity')
      await user.clear(quantityInput)
      await user.type(quantityInput, '1')

      // And submits the form
      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      // Then form submission should be handled properly without page reload
      await waitFor(() => {
        expect(mockUpdateParcelInfo).toHaveBeenCalled()
        expect(mockGoNext).toHaveBeenCalled()
      })
    })
  })
})
