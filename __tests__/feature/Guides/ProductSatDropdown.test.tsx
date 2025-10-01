import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  describe('Dropdown visibility on focus', () => {
    it('should show dropdown when input field is focused', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user focuses on the input field
      const input = screen.getByTestId('product-autocomplete')
      await user.click(input)

      // Then dropdown should become visible
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('should show initial message when dropdown is opened with empty search', async () => {
      // Given the ProductSatDropdown is rendered with empty search term
      const user = userEvent.setup()
      renderComponent({ searchProductSat: '' })

      // When user focuses on the input field
      const input = screen.getByTestId('product-autocomplete')
      await user.click(input)

      // Then dropdown should show initial message
      expect(screen.getByText('Escribe para buscar productos')).toBeInTheDocument()
    })

    it('should hide dropdown when input field loses focus', async () => {
      // Given the ProductSatDropdown is rendered and dropdown is open
      const user = userEvent.setup()
      renderComponent()
      
      const input = screen.getByTestId('product-autocomplete')
      await user.click(input)
      
      // Verify dropdown is visible
      expect(screen.getByRole('list')).toBeInTheDocument()

      // When user blurs the input field
      await user.tab()

      // Then dropdown should be hidden after delay
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument()
      }, { timeout: 300 })
    })
  })

  describe('Valid input handling', () => {
    it('should call setSearchProductSat when user types valid text', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types valid text in input
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'ropa')

      // Then setSearchProductSat should be called for each character typed
      expect(mockSetSearchProductSat).toHaveBeenCalledTimes(4)
      // Each call receives the individual character being typed
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(1, 'r')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(2, 'o')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(3, 'p')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(4, 'a')
    })

    it('should clear error when user types valid text and error exists', async () => {
      // Given the ProductSatDropdown is rendered with an existing error
      const user = userEvent.setup()
      renderComponent({ errorProductSat: 'Test error message' })

      // When user types valid text in input
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'a')

      // Then updateErrorProductSat should be called to clear the error
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('')
    })

    it('should accept letters and numbers as valid characters', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types letters and numbers
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'abc123')

      // Then setSearchProductSat should be called for each character
      expect(mockSetSearchProductSat).toHaveBeenCalledTimes(6)
      // Verify individual characters are passed
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(1, 'a')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(2, 'b')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(3, 'c')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(4, '1')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(5, '2')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(6, '3')
    })

    it('should accept spaces as valid characters', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types text with spaces
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'a b')

      // Then setSearchProductSat should be called for each character including space
      expect(mockSetSearchProductSat).toHaveBeenCalledTimes(3)
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(1, 'a')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(2, ' ')
      expect(mockSetSearchProductSat).toHaveBeenNthCalledWith(3, 'b')
    })

    it('should not call updateErrorProductSat when typing valid characters and no error exists', async () => {
      // Given the ProductSatDropdown is rendered without error
      const user = userEvent.setup()
      renderComponent({ errorProductSat: '' })

      // When user types valid text
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'valid text')

      // Then updateErrorProductSat should not be called for error clearing
      expect(mockUpdateErrorProductSat).not.toHaveBeenCalled()
    })
  })

  describe('Special character validation', () => {
    it('should display error when user types special characters', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types special characters
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, '@')

      // Then updateErrorProductSat should be called with the error message
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')
    })

    it('should display error for various special characters', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types different special characters
      const input = screen.getByTestId('product-autocomplete')
      
      // Test different special characters one by one
      await user.clear(input)
      await user.type(input, '#')
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')

      await user.clear(input)
      await user.type(input, '$')
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')

      await user.clear(input)
      await user.type(input, '%')
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')

      await user.clear(input)
      await user.type(input, '!')
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')
    })

    it('should display error when special characters are mixed with valid text', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types valid text followed by special character
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, 'abc@')

      // Then updateErrorProductSat should be called with the error message
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')
    })

    it('should call setSearchProductSat even when special characters are entered', async () => {
      // Given the ProductSatDropdown is rendered
      const user = userEvent.setup()
      renderComponent()

      // When user types special characters
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, '@#')

      // Then setSearchProductSat should still be called for each character
      expect(mockSetSearchProductSat).toHaveBeenCalledWith('@')
      expect(mockSetSearchProductSat).toHaveBeenCalledWith('#')
      expect(mockSetSearchProductSat).toHaveBeenCalledTimes(2)
    })

    it('should not trigger error for valid characters after special character validation', async () => {
      // Given the ProductSatDropdown is rendered and user has typed special character
      const user = userEvent.setup()
      renderComponent()
      
      // First type a special character to trigger error
      const input = screen.getByTestId('product-autocomplete')
      await user.type(input, '@')
      expect(mockUpdateErrorProductSat).toHaveBeenCalledWith('No se permiten caracteres especiales')
      
      // Clear the mock to reset call count
      mockUpdateErrorProductSat.mockClear()
      
      // When user then types valid characters
      await user.clear(input)
      await user.type(input, 'abc')

      // Then no error should be triggered for valid characters
      expect(mockUpdateErrorProductSat).not.toHaveBeenCalledWith('No se permiten caracteres especiales')
    })
  })
})
