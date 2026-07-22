import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosResponse } from 'axios'

import { AppRouterContextProviderMock } from '@/features/AppRouterContextProviderMock'
import { Dashboard } from '@/features/Dashboard/Dashboard'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { BALANCE_API_ENDPOINT } from '@/shared/constants/global.constants'
import { GetBalanceResponse } from '@/shared/types/balance.types'
import { LoginData } from '@/shared/types/login.types'

jest.mock('axios')
jest.mock('../../../src/shared/hooks/useMediaQuery')
jest.mock('../../../src/shared/lib/preferences.lib', () => ({
  getThemePreference: jest.fn(() => Promise.resolve('light')),
  saveThemeCookie: jest.fn(),
  saveDashboardScreen: jest.fn()
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

const userInfo: LoginData = {
  data: {
    user: {
      name: 'Juan',
      lastName: 'Perez',
      email: 'juan@example.com',
      role: ['admin']
    }
  },
  error: null,
  message: null,
  success: true,
  version: '1.0'
}

const balanceResponse: GetBalanceResponse = {
  version: '1.0',
  data: {
    balance: {
      amount: 31.45
    }
  },
  message: null,
  error: null
}

const mediaQueryResult = {
  isMobile: false,
  isTablet: false,
  isTabletDesktop: false,
  isMobileTablet: false,
  isDesktop: true,
  isDesktopX2: false
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

const renderDashboard = () => render(
  <QueryClientProvider client={createQueryClient()}>
    <AppRouterContextProviderMock router={{ push: jest.fn() }}>
      <Dashboard userInfo={userInfo} />
    </AppRouterContextProviderMock>
  </QueryClientProvider>
)

const mockAxiosGet = () => {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === BALANCE_API_ENDPOINT) {
      return Promise.resolve({ data: balanceResponse, status: 200 } as AxiosResponse<GetBalanceResponse>)
    }

    return Promise.resolve({
      data: {
        guides: [],
        messages: [],
        data: {
          guides: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        }
      },
      status: 200
    } as AxiosResponse)
  })
}

describe('Dashboard balance surface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    })) as jest.Mock
    mockAxiosGet()
  })

  it('renders one desktop sidebar balance surface', async () => {
    mockedUseMediaQuery.mockReturnValue(mediaQueryResult)

    renderDashboard()

    expect(await screen.findByText('$31.45')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/saldo disponible/i)).toHaveLength(1)
    expect(screen.getByRole('button', { name: /cotizaciones/i })).toBeInTheDocument()
  })

  it('renders one mobile and tablet balance surface below the menu header', async () => {
    mockedUseMediaQuery.mockReturnValue({
      ...mediaQueryResult,
      isMobile: true,
      isMobileTablet: true,
      isDesktop: false
    })

    renderDashboard()

    expect(await screen.findByText('$31.45')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/saldo disponible/i)).toHaveLength(1)
  })

  it('keeps navigation usable when balance fails', async () => {
    mockedUseMediaQuery.mockReturnValue(mediaQueryResult)
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === BALANCE_API_ENDPOINT) return Promise.reject(new Error('Network error'))

      return Promise.resolve({
        data: {
          guides: [],
          messages: [],
          data: {
            guides: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0
            }
          }
        },
        status: 200
      } as AxiosResponse)
    })

    renderDashboard()
    expect(await screen.findByText(/no disponible/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /ver guias/i }))

    expect(await screen.findByText(/ver guias externas/i)).toBeInTheDocument()
  })
})
