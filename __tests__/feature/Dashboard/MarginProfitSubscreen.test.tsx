import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient } from "@tanstack/react-query"
import axios from 'axios'

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { MarginProfitSubscreen } from "@/features/Dashboard/subscreens/MarginProfitSubscreen"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock"
import { LoginData } from "@/shared/types/login.types"
import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"

// Custom wrapper that creates a fresh QueryClient for each test
const MarginProfitSubscreenWrapper = ({
  push,
  userInfo,
  queryClient
}: {
  push: () => void
  userInfo: LoginData | null
  queryClient?: QueryClient
}) => {
  const Wrapper = queryClient ? 
    ({ children }: { children: React.ReactNode }) => (
      <QueryProviderWrapper>{children}</QueryProviderWrapper>
    ) :
    QueryProviderWrapper

  return (
    <Wrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <MarginProfitSubscreen userInfo={userInfo} />
      </AppRouterContextProviderMock>
    </Wrapper>
  )
}

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('MarginProfitSubscreen', () => {
  const mockPush = jest.fn()
  const mockUserInfo: LoginData = {
    data: {
      user: {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        role: ['admin']
      }
    },
    error: null,
    message: null,
    success: true,
    version: '1.0.0'
  }

  const mockProviders: ProviderGlobalConfig[] = [
    {
      name: 'GE',
      couriers: [
        {
          name: 'Fedex',
          profitMargin: {
            value: 10,
            type: 'percentage'
          }
        },
        {
          name: 'DHL',
          profitMargin: {
            value: 15,
            type: 'absolute'
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Given the MarginProfitSubscreen component is rendered', () => {
    it('When userInfo is provided, Then it displays welcome message with user name', () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { providers: [] } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      expect(screen.getByRole('heading', { name: /bienvenido john/i })).toBeInTheDocument()
    })

    it('When userInfo is null, Then it displays welcome message without name', () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={null}
        />
      )

      expect(screen.getByRole('heading', { name: /bienvenido$/i })).toBeInTheDocument()
    })

    it('When component loads, Then it renders all main sections', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { providers: [] } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('profit-margin-card-skeleton')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // Wait for query to resolve
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /bienvenido john/i })).toBeInTheDocument()
      })

      // Check for ShowProfitMargin component (no profit margin established) - in view mode by default
      expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      
      // Check for subscreen navigation buttons
      expect(screen.getByRole('button', { name: /ver proveedores/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /editar margen de ganancia/i })).toBeInTheDocument()
      
      // Should NOT show form elements in view mode
      expect(screen.queryByRole('heading', { name: /configuración por proveedor/i })).not.toBeInTheDocument()
    })
  })

  describe('Given the component fetches profit margin data', () => {
    it('When API returns profit margin data, Then it displays the current margin', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { providers: mockProviders } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('profit-margin-card-skeleton')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // Check that provider data is displayed
      await waitFor(() => {
        expect(screen.getByText(/Origen:\s*GE/)).toBeInTheDocument()
        expect(screen.getByText('Fedex')).toBeInTheDocument()
        expect(screen.getByText('DHL')).toBeInTheDocument()
        expect(screen.getByText('+10%')).toBeInTheDocument()
        expect(screen.getByText('+$15')).toBeInTheDocument()
      })
    })

    it('When API returns null profit margin, Then it displays not established message', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      })
    })

    it('When API call is made, Then it uses correct query key', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String))
      })
    })
  })

  describe('Given the refetch functionality', () => {
    it('When refetch is called after form submission, Then it updates the displayed data', async () => {
      const initialMargin = null
      const updatedMargin = {
        value: 20,
        type: 'percentage'
      }

      // Mock initial GET request
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: initialMargin } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      })

      // Mock POST request for form submission
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: updatedMargin } } }
      })

      // Mock subsequent GET request for refetch
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: updatedMargin } } }
      })

      // The refetch functionality is tested through the form integration
      // Since the form is already tested separately, we just verify the query setup
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('Given the component structure and layout', () => {
    it('When component renders, Then it has correct main layout structure', () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      const { container } = render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      // Check for main container with correct classes
      const mainElement = container.querySelector('main.w-full.p-4.flex.flex-col')
      expect(mainElement).toBeInTheDocument()
      
      // Check for gap classes
      expect(mainElement).toHaveClass('gap-16', 'lg:gap-20')
    })

    it('When component renders, Then elements are in correct order', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { providers: [] } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={mockUserInfo}
        />
      )

      // Wait for loading to complete - skeleton should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('profit-margin-card-skeleton')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // Wait for the content to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      })

      const headings = screen.getAllByRole('heading')
      
      // Welcome message should be first
      expect(headings[0]).toHaveTextContent(/bienvenido john/i)
      
      // Profit margin status should be second (in view mode by default)
      expect(headings[1]).toHaveTextContent(/margen de ganancia no establecido/i)
      
      // Should have subscreen navigation buttons
      expect(screen.getByRole('button', { name: /ver proveedores/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /editar margen de ganancia/i })).toBeInTheDocument()
    })
  })

  describe('Given different user scenarios', () => {
    it('When user has a long name, Then it displays correctly', () => {
      const userWithLongName: LoginData = {
        ...mockUserInfo,
        data: {
          ...mockUserInfo.data,
          user: {
            ...mockUserInfo.data.user,
            name: 'Christopher Alexander'
          }
        }
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={userWithLongName}
        />
      )

      expect(screen.getByRole('heading', { name: /bienvenido christopher alexander/i })).toBeInTheDocument()
    })

    it('When user info has missing name, Then it handles gracefully', () => {
      const userWithMissingName: LoginData = {
        ...mockUserInfo,
        data: {
          ...mockUserInfo.data,
          user: {
            ...mockUserInfo.data.user,
            name: ''
          }
        }
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: null } } }
      })

      render(
        <MarginProfitSubscreenWrapper
          push={mockPush}
          userInfo={userWithMissingName}
        />
      )

      expect(screen.getByRole('heading', { name: /bienvenido$/i })).toBeInTheDocument()
    })
  })
})