import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

import { ParcelInfoFormGE } from "@/features/Guides/GE/ParcelInfoFormGE"
import { ParcelInfoValuesGE, SearchProduct } from "@/shared/types/guides.types"

const emptyParcelInfo: ParcelInfoValuesGE = {
  content: '',
  satProductId: '',
  length: '',
  width: '',
  height: '',
  weight: ''
}

const filledParcelInfo: ParcelInfoValuesGE = {
  content: 'Libros',
  satProductId: '12345',
  length: '',
  width: '',
  height: '',
  weight: ''
}

const mockSelectedProduct: SearchProduct = {
  code: '12345',
  description: 'Libros de texto'
}

const ParcelInfoFormGEWrapper = ({
  children = null,
  isMobileTablet = false,
  parcelInfo = emptyParcelInfo,
  searchProductSat = '',
  selectedProduct = null,
  goPrev = jest.fn(),
  goNext = jest.fn(),
  updateParcelInfo = jest.fn(),
  updateErrorProductSat = jest.fn()
}: Partial<React.ComponentProps<typeof ParcelInfoFormGE>>) => {
  return (
    <ParcelInfoFormGE
      children={children}
      isMobileTablet={isMobileTablet}
      parcelInfo={parcelInfo}
      searchProductSat={searchProductSat}
      selectedProduct={selectedProduct}
      goPrev={goPrev}
      goNext={goNext}
      updateParcelInfo={updateParcelInfo}
      updateErrorProductSat={updateErrorProductSat}
    />
  )
}

describe('Feature: Parcel Info Form GE', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Render form with mobile/tablet heading', () => {
    it('Given isMobileTablet is true, When the component renders, Then it should display the heading', () => {
      render(<ParcelInfoFormGEWrapper isMobileTablet={true} />)

      expect(screen.getByText(/información del paquete/i)).toBeInTheDocument()
    })

    it('Given isMobileTablet is false, When the component renders, Then it should not display the heading', () => {
      render(<ParcelInfoFormGEWrapper isMobileTablet={false} />)

      expect(screen.queryByText(/información del paquete/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Render form with children', () => {
    it('Given children prop is provided, When the component renders, Then it should display the children content', () => {
      const childContent = <div>Test Child Content</div>

      render(<ParcelInfoFormGEWrapper>{childContent}</ParcelInfoFormGEWrapper>)

      expect(screen.getByText('Test Child Content')).toBeInTheDocument()
    })
  })

  describe('Scenario: Initialize form with existing parcel data', () => {
    it('Given parcelInfo with content, When the component renders, Then it should display the content in the input', () => {
      render(<ParcelInfoFormGEWrapper parcelInfo={filledParcelInfo} />)

      const contentInput = screen.getByTestId('content') as HTMLInputElement
      expect(contentInput.value).toBe('Libros')
    })
  })

  describe('Scenario: Form displays content field', () => {
    it('Given the component renders, When user views the form, Then it should display content field with label', () => {
      render(<ParcelInfoFormGEWrapper />)

      expect(screen.getByLabelText(/contenido del paquete/i)).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('Scenario: Form buttons are present', () => {
    it('Given the component renders, When user views the form, Then it should display Regresar and Siguiente buttons', () => {
      render(<ParcelInfoFormGEWrapper />)

      expect(screen.getByTestId('parcel-info-form-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('parcel-info-form-next-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Validate content field is required', () => {
    it('Given user submits empty form, When validation runs, Then it should show required error', async () => {
      const user = userEvent.setup()
      const updateParcelInfo = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          updateParcelInfo={updateParcelInfo}
          searchProductSat="test product"
          selectedProduct={mockSelectedProduct}
        />
      )

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/contenido es requerido/i)).toBeInTheDocument()
      })

      expect(updateParcelInfo).not.toHaveBeenCalled()
    })

    it('Given user enters content with less than 2 characters, When validation runs, Then it should show minimum length error', async () => {
      const user = userEvent.setup()
      const updateParcelInfo = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          updateParcelInfo={updateParcelInfo}
          searchProductSat="test product"
          selectedProduct={mockSelectedProduct}
        />
      )

      const contentInput = screen.getByTestId('content')
      await user.type(contentInput, 'A')

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el contenido debe tener al menos 2 caracteres/i)).toBeInTheDocument()
      })

      expect(updateParcelInfo).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Validate product selection', () => {
    it('Given searchProductSat is empty, When user submits form, Then it should show error about searching product', async () => {
      const user = userEvent.setup()
      const updateErrorProductSat = jest.fn()
      const updateParcelInfo = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          parcelInfo={filledParcelInfo}
          searchProductSat=""
          selectedProduct={null}
          updateErrorProductSat={updateErrorProductSat}
          updateParcelInfo={updateParcelInfo}
        />
      )

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateErrorProductSat).toHaveBeenCalledWith('Debes de buscar un producto para categorizarlo')
      })

      expect(updateParcelInfo).not.toHaveBeenCalled()
    })

    it('Given searchProductSat exists but selectedProduct is null, When user submits form, Then it should show error about selecting valid product', async () => {
      const user = userEvent.setup()
      const updateErrorProductSat = jest.fn()
      const updateParcelInfo = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          parcelInfo={filledParcelInfo}
          searchProductSat="some search"
          selectedProduct={null}
          updateErrorProductSat={updateErrorProductSat}
          updateParcelInfo={updateParcelInfo}
        />
      )

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateErrorProductSat).toHaveBeenCalledWith('Debes de seleccionar un producto válido de la lista')
      })

      expect(updateParcelInfo).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Submit form with valid data', () => {
    it('Given all fields are valid and product is selected, When user submits form, Then it should call updateParcelInfo and goNext', async () => {
      const user = userEvent.setup()
      const updateParcelInfo = jest.fn()
      const goNext = jest.fn()
      const updateErrorProductSat = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          searchProductSat="libros"
          selectedProduct={mockSelectedProduct}
          updateParcelInfo={updateParcelInfo}
          goNext={goNext}
          updateErrorProductSat={updateErrorProductSat}
        />
      )

      const contentInput = screen.getByTestId('content')
      await user.type(contentInput, 'Libros educativos')

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateParcelInfo).toHaveBeenCalledWith({
          content: 'Libros educativos',
          satProductId: '12345',
          length: '',
          width: '',
          height: '',
          weight: ''
        })
        expect(goNext).toHaveBeenCalled()
      })

      expect(updateErrorProductSat).not.toHaveBeenCalled()
    })

    it('Given form is pre-filled with valid data and product is selected, When user submits, Then it should call updateParcelInfo with existing content', async () => {
      const user = userEvent.setup()
      const updateParcelInfo = jest.fn()
      const goNext = jest.fn()

      render(
        <ParcelInfoFormGEWrapper
          parcelInfo={filledParcelInfo}
          searchProductSat="libros"
          selectedProduct={mockSelectedProduct}
          updateParcelInfo={updateParcelInfo}
          goNext={goNext}
        />
      )

      const submitButton = screen.getByTestId('parcel-info-form-next-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateParcelInfo).toHaveBeenCalledWith({
          content: 'Libros',
          satProductId: '12345',
          length: '',
          width: '',
          height: '',
          weight: ''
        })
        expect(goNext).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Handle Regresar button click', () => {
    it('Given user clicks Regresar button, When the click event occurs, Then it should call goPrev', async () => {
      const user = userEvent.setup()
      const goPrev = jest.fn()

      render(<ParcelInfoFormGEWrapper goPrev={goPrev} />)

      const regresarButton = screen.getByTestId('parcel-info-form-cancel-button')
      await user.click(regresarButton)

      expect(goPrev).toHaveBeenCalled()
    })
  })

  describe('Scenario: User can modify content field', () => {
    it('Given user types in content field, When input changes, Then it should update the field value', async () => {
      const user = userEvent.setup()

      render(<ParcelInfoFormGEWrapper />)

      const contentInput = screen.getByTestId('content') as HTMLInputElement
      await user.type(contentInput, 'Test content')

      expect(contentInput.value).toBe('Test content')
    })

    it('Given form has pre-filled content, When user clears and types new content, Then it should update to new value', async () => {
      const user = userEvent.setup()

      render(<ParcelInfoFormGEWrapper parcelInfo={filledParcelInfo} />)

      const contentInput = screen.getByTestId('content') as HTMLInputElement
      expect(contentInput.value).toBe('Libros')

      await user.clear(contentInput)
      await user.type(contentInput, 'New content')

      expect(contentInput.value).toBe('New content')
    })
  })
})
