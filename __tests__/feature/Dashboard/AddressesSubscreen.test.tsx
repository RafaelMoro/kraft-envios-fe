import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AddressesSubscreen } from "@/features/Dashboard/subscreens/AddressesSubscreen"
import { LoginData } from "@/shared/types/login.types"
import { Address } from "@/shared/types/addresses.types"

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
})

const AddressesSubscreenWrapper = ({
  userInfo
}: {
  userInfo: LoginData | null
}) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <AddressesSubscreen userInfo={userInfo} />
    </QueryClientProvider>
  )
}

const mockUserInfo: LoginData = {
  data: {
    user: {
      email: 'test@example.com',
      name: 'Juan',
      lastName: 'Pérez',
      role: ['user']
    }
  },
  error: null,
  message: null,
  success: true,
  version: '1.0.0'
}

const mockAddresses: Address[] = [
  {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '4',
    reference: 'Cerca del parque',
    postalCode: '12345',
    state: 'CDMX',
    city: ['Ciudad de México'],
    town: ['Cuauhtémoc'],
    alias: 'Casa',
    neighborhood: 'Centro'
  },
  {
    addressName: 'Avenida Reforma',
    externalNumber: '456',
    internalNumber: '',
    reference: '',
    postalCode: '54321',
    state: 'Jalisco',
    city: ['Guadalajara'],
    town: ['Zapopan'],
    alias: 'Oficina',
    neighborhood: 'Providencia'
  }
]

describe('Feature: Addresses Subscreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display welcome message with user name', () => {
    it('Given a logged-in user, When the subscreen renders, Then it should display the welcome message with user name', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.getByText(/bienvenido juan/i)).toBeInTheDocument()
      expect(screen.getByText(/aquí puedes gestionar las direcciones/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display create address button', () => {
    it('Given the subscreen is rendered, When the component loads, Then it should display the create address button', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.getByRole('button', { name: /crear dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Open create address modal when button is clicked', () => {
    it('Given the subscreen is rendered, When the user clicks the create address button, Then the create address modal should be displayed', async () => {
      const user = userEvent.setup()

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      const createButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /crear dirección/i })).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Close create address modal when cancel is clicked', () => {
    it('Given the create address modal is open, When the user clicks cancel, Then the modal should close', async () => {
      const user = userEvent.setup()

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      const createButton = screen.getByRole('button', { name: /crear dirección/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /crear dirección/i })).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /crear dirección/i })).not.toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Handle null user info gracefully', () => {
    it('Given userInfo is null, When the subscreen renders, Then it should display the welcome message without a name', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={null} />)

      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Notification is not displayed initially', () => {
    it('Given the subscreen is rendered, When the component loads, Then no notification should be displayed', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display loading skeletons while fetching addresses', () => {
    it('Given addresses are being fetched, When the component is loading, Then it should display skeleton cards', async () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}))

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      await waitFor(() => {
        const skeletons = screen.getAllByTestId('address-card-skeleton')
        expect(skeletons).toHaveLength(3)
      })
    })
  })

  describe('Scenario: Display error message when address fetch fails', () => {
    it('Given the API returns an error, When addresses fail to load, Then it should display an error message', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      expect(screen.getByText('Ha sucedido un error. Intentelo nuevamente')).toBeInTheDocument()
    })
  })

  describe('Scenario: Display address cards when addresses are loaded successfully', () => {
    it('Given addresses are fetched successfully, When the component renders, Then it should display address cards', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: mockAddresses },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      await waitFor(() => {
        expect(screen.getByText('Casa')).toBeInTheDocument()
        expect(screen.getByText('Oficina')).toBeInTheDocument()
      })

      expect(screen.getByText(/calle principal, 123, int\. 4, centro/i)).toBeInTheDocument()
      expect(screen.getByText(/avenida reforma, 456, providencia/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display no addresses when empty list is returned', () => {
    it('Given the API returns an empty address list, When the component renders, Then it should not display any address cards', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: { addresses: [] },
          error: null,
          message: null,
          success: true,
          version: '1.0.0'
        }
      })

      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      await waitFor(() => {
        expect(screen.queryByText('Casa')).not.toBeInTheDocument()
        expect(screen.queryByText('Oficina')).not.toBeInTheDocument()
      })
    })
  })
})
