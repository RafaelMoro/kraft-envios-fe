import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ParcelInfoGuideDbForm } from '@/features/Guides-DB/ParcelInfoGuideDbForm'
import {
  CreateGuideDbFormValues,
  PackageDimensions,
  SearchProduct,
} from '@/shared/types/guides.types'

const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockUpdateParcelInfo = jest.fn()
const mockUpdateErrorProductSat = jest.fn()

const baseParcelInfo: CreateGuideDbFormValues['parcelInfo'] = {
  content: '',
  value: '',
  quantity: '',
  notifyMe: false,
}

const baseDimensions: PackageDimensions = {
  length: '20',
  width: '15',
  height: '10',
  weight: '2',
}

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ParcelInfoGuideDbForm>> = {},
) => {
  const defaultProps = {
    children: <div data-testid="parcel-children" />,
    parcelInfo: baseParcelInfo,
    packageDimensions: baseDimensions,
    isMobileTablet: false,
    searchProductSat: 'documentos',
    selectedProduct: { code: 'SAT-001', description: 'Documentos' } as SearchProduct,
    goNext: mockGoNext,
    goPrev: mockGoPrev,
    updateParcelInfo: mockUpdateParcelInfo,
    updateErrorProductSat: mockUpdateErrorProductSat,
  }
  return render(<ParcelInfoGuideDbForm {...defaultProps} {...props} />)
}

describe('ParcelInfoGuideDbForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('When rendered, Then it shows the four disabled package dimensions from the quote', () => {
      renderComponent()

      const length = screen.getByTestId('db-length') as HTMLInputElement
      const width = screen.getByTestId('db-width') as HTMLInputElement
      const height = screen.getByTestId('db-height') as HTMLInputElement
      const weight = screen.getByTestId('db-weight') as HTMLInputElement

      expect(length.value).toBe('20')
      expect(width.value).toBe('15')
      expect(height.value).toBe('10')
      expect(weight.value).toBe('2')
      expect(length.disabled).toBe(true)
      expect(width.disabled).toBe(true)
      expect(height.disabled).toBe(true)
      expect(weight.disabled).toBe(true)
    })

    it('When packageDimensions is null, Then the dimension inputs are empty', () => {
      renderComponent({ packageDimensions: null })

      expect((screen.getByTestId('db-length') as HTMLInputElement).value).toBe('')
    })

    it('When isMobileTablet is true, Then it shows the mobile heading', () => {
      renderComponent({ isMobileTablet: true })

      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Información del paquete')
    })

    it('When rendered, Then it renders the children (sat dropdown) inside the form', () => {
      renderComponent()

      expect(screen.getByTestId('parcel-children')).toBeInTheDocument()
    })
  })

  describe('Field interactions', () => {
    it('When the user types content, value, and quantity, Then the inputs reflect the new values', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.type(screen.getByTestId('db-content'), 'Libros')
      await user.type(screen.getByTestId('db-value'), '500')
      await user.type(screen.getByTestId('db-quantity'), '3')

      expect(screen.getByTestId('db-content')).toHaveValue('Libros')
      expect(screen.getByTestId('db-value')).toHaveValue(500)
      expect(screen.getByTestId('db-quantity')).toHaveValue(3)
    })

    it('When the user toggles notifyMe, Then the checkbox reflects the new state', async () => {
      const user = userEvent.setup()
      renderComponent({ parcelInfo: { ...baseParcelInfo, notifyMe: false } })

      const checkbox = screen.getByTestId('db-notify-me') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Edit mode', () => {
    it('shows non-editable quote fields and accepts the saved SAT ID without a new selection', async () => {
      const user = userEvent.setup()
      renderComponent({
        editMode: true,
        existingSatProductId: 'SAT-001',
        searchProductSat: 'SAT-001',
        selectedProduct: null,
        parcelInfo: { ...baseParcelInfo, content: 'Documentos', value: '500', quantity: '2', notifyMe: true },
      })

      expect(screen.getByTestId('db-value')).toBeDisabled()
      expect(screen.getByTestId('db-quantity')).toBeDisabled()
      expect(screen.getByTestId('db-notify-me')).toBeDisabled()
      expect(screen.getByText(/Estos datos vienen de la cotización/i)).toBeInTheDocument()

      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('requires a selected SAT product after changing the saved SAT ID', async () => {
      const user = userEvent.setup()
      renderComponent({
        editMode: true,
        existingSatProductId: 'SAT-001',
        searchProductSat: 'SAT-002',
        selectedProduct: null,
        parcelInfo: { ...baseParcelInfo, content: 'Documentos' },
      })

      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith(
        'Debes de seleccionar un producto válido de la lista',
      )
    })
  })

  describe('Navigation', () => {
    it('When the Regresar button is clicked, Then it calls goPrev and not the submit handler', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('db-parcel-prev-button'))

      expect(mockGoPrev).toHaveBeenCalledTimes(1)
      expect(mockUpdateParcelInfo).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Submit validation', () => {
    it('When searchProductSat is empty, Then it blocks submit and calls updateErrorProductSat', async () => {
      const user = userEvent.setup()
      renderComponent({ searchProductSat: '' })

      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith(
        'Debes de buscar un producto para categorizarlo',
      )
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('When selectedProduct is null, Then it blocks submit with the select-a-product error', async () => {
      const user = userEvent.setup()
      renderComponent({ selectedProduct: null })

      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith(
        'Debes de seleccionar un producto válido de la lista',
      )
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('When content is empty, Then it shows the content error and blocks submit', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(screen.getByText('Contenido es requerido')).toBeInTheDocument()
      expect(mockUpdateParcelInfo).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('When content is shorter than 2 chars, Then it shows the content error', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.type(screen.getByTestId('db-content'), 'A')
      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(screen.getByText('Contenido es requerido')).toBeInTheDocument()
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('When packageDimensions is null, Then it blocks submit with the re-quote error', async () => {
      const user = userEvent.setup()
      renderComponent({ packageDimensions: null })

      await user.type(screen.getByTestId('db-content'), 'Libros')
      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith(
        'No hay dimensiones del paquete disponibles. Vuelve a cotizar.',
      )
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Happy path', () => {
    it('When all guards pass, Then it calls updateParcelInfo with trimmed content and goNext', async () => {
      const user = userEvent.setup()
      renderComponent({
        parcelInfo: { ...baseParcelInfo, notifyMe: true },
      })

      await user.type(screen.getByTestId('db-content'), '  Libros  ')
      await user.type(screen.getByTestId('db-value'), '500')
      await user.type(screen.getByTestId('db-quantity'), '3')
      await user.click(screen.getByTestId('db-parcel-next-button'))

      expect(mockUpdateParcelInfo).toHaveBeenCalledTimes(1)
      const submitted = mockUpdateParcelInfo.mock.calls[0][0]
      expect(submitted.content).toBe('Libros')
      expect(submitted.value).toBe('500')
      expect(submitted.quantity).toBe('3')
      expect(submitted.notifyMe).toBe(true)
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })
})
