import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductSatDropdown } from '@/features/Guides/ProductSatDropdown'

// Mock the guides utils
jest.mock('../../../src/shared/utils/guides.utils', () => ({
  getProductSatInfo: jest.fn()
}))

// Mock functions for props
const mockSetSearchProductSat = jest.fn()
const mockUpdateSelectedOption = jest.fn()
const mockUpdateErrorProductSat = jest.fn()

const defaultProps = {
  searchProductSat: '',
  errorProductSat: '',
  setSearchProductSat: mockSetSearchProductSat,
  updateSelectedOption: mockUpdateSelectedOption,
  updateErrorProductSat: mockUpdateErrorProductSat
}

const renderComponent = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  const mergedProps = { ...defaultProps, ...props }
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductSatDropdown {...mergedProps} />
    </QueryClientProvider>
  )
}

describe('ProductSatDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial component rendering', () => {
    it('should display input field with correct placeholder and label when component loads', () => {
      // Given the ProductSatDropdown is rendered with initial props
      renderComponent()

      // Then input field should be displayed with correct placeholder and label
      expect(screen.getByText(/tipo de producto/i)).toBeInTheDocument()
      expect(screen.getByTestId('product-autocomplete')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ropa')).toBeInTheDocument()
      expect(screen.getByTestId('product-autocomplete')).toHaveValue('')
    })

    it('should have dropdown hidden initially', () => {
      // Given the ProductSatDropdown is rendered with initial props
      renderComponent()

      // Then dropdown should be hidden initially
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(screen.queryByText(/escribe para buscar productos/i)).not.toBeInTheDocument()
    })

    it('should not show error message when errorProductSat is empty', () => {
      // Given the ProductSatDropdown is rendered with no error
      renderComponent({ errorProductSat: '' })

      // Then no error message should be shown
      expect(screen.queryByText(/no se permiten caracteres especiales/i)).not.toBeInTheDocument()
    })

    it('should display error message when errorProductSat prop has value', () => {
      // Given the ProductSatDropdown is rendered with error message
      const errorMessage = 'Test error message'
      renderComponent({ errorProductSat: errorMessage })

      // Then error message should be displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should display input with provided searchProductSat value', () => {
      // Given the ProductSatDropdown is rendered with search value
      const searchValue = 'Test product'
      renderComponent({ searchProductSat: searchValue })

      // Then input should display the provided value
      expect(screen.getByTestId('product-autocomplete')).toHaveValue(searchValue)
    })
  })
})
