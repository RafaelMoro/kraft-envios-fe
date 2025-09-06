import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios'

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { ProfitMarginForm } from "@/features/ProfitMargin/ProfitMarginForm"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock"
import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"

const mockData: ProviderGlobalConfig[] = [
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

const ProfitMarginFormWrapper = ({
  push,
  refetchMarginProfit,
  updateSubscreen,
  data = mockData,
}: {
  push: () => void
  refetchMarginProfit: () => Promise<void>
  updateSubscreen?: (subscreen: string) => void
  data?: ProviderGlobalConfig[] | null | undefined
}) => {
  const mockUpdateSubscreen = updateSubscreen || jest.fn()
  
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <ProfitMarginForm 
          refetchMarginProfit={refetchMarginProfit} 
          updateSubscreen={mockUpdateSubscreen}
          data={data}
        />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ProfitMarginForm', () => {
  const mockRefetchMarginProfit = jest.fn()
  const mockUpdateSubscreen = jest.fn()
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Given the ProfitMarginForm component is rendered', () => {
    it('When the component loads, Then it displays all required form elements', () => {
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
        />
      )

      expect(screen.getByRole('heading', { name: /configuración por proveedor/i })).toBeInTheDocument()
      expect(screen.getByText(/configure los margenes de ganancia por paquetería y por proveedor/i)).toBeInTheDocument()
      expect(screen.getByText(/seleccione el proveedor/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ge/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /agregar paquetería/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /guardar configuración/i })).toBeInTheDocument()
    })

    it('When no courier forms are added, Then it shows empty state message', () => {
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
          data={[]}
        />
      )

      expect(screen.getByText(/no ha agregado ninguna paquetería/i)).toBeInTheDocument()
      expect(screen.getByText(/de click en "agregar paquetería" para añadir una nueva configuración/i)).toBeInTheDocument()
    })

    it('When data is provided, Then it loads existing courier forms', () => {
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
        />
      )

      // Since we have mock data with existing couriers, the mocked CourierProfitMarginForm should be rendered
      expect(screen.getByRole('heading', { name: /fedex/i })).toBeInTheDocument()
      expect(screen.getByText(/Porcentaje/i)).toBeInTheDocument()
    })
  })

  describe('Given the user interacts with the provider selection', () => {
    it('When the provider dropdown is clicked, Then it shows available providers', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
        />
      )

      const providerDropdown = screen.getByRole('button', { name: /ge/i })
      await user.click(providerDropdown)

      // Should show available providers in the dropdown
      expect(screen.getAllByText('GE')).toHaveLength(2) // One in button, one in dropdown
    })
  })

  describe('Given the user adds courier forms', () => {
    it('When the "Agregar paquetería" button is clicked, Then a new courier form is added', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
          data={[]}
        />
      )

      const addButton = screen.getByRole('button', { name: /agregar paquetería/i })
      await user.click(addButton)

      // The empty state message should disappear when a form is added
      expect(screen.queryByText(/no ha agregado ninguna paquetería/i)).not.toBeInTheDocument()
      // A new courier form should be added (mocked)
      expect(screen.getByRole('heading', { name: /fedex/i })).toBeInTheDocument()
    })
  })

  describe('Given the user submits the form', () => {
    it('When the form is submitted without any courier forms, Then it shows validation error', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
          data={[]}
        />
      )

      const submitButton = screen.getByRole('button', { name: /guardar configuración/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/debe agregar al menos una paquetería/i)).toBeInTheDocument()
      })
    })

    it('When the form is submitted with a courier form, Then validation passes and API is called', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { providers: mockData } }
      })
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
          data={[]}
        />
      )

      // Add a courier form first
      const addButton = screen.getByRole('button', { name: /agregar paquetería/i })
      await user.click(addButton)
      
      const valueInput = screen.getByTestId(/profit-margin-value-/i)
      await user.clear(valueInput)
      await user.type(valueInput, '20')

      // Wait for debounce using act and Promise
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600)) // 500ms + buffer
      })
      
      const submitButton = screen.getByRole('button', { name: /guardar configuración/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            providers: expect.any(Array)
          })
        )
      })
    })

    it('When the form is submitted successfully with existing data, Then it calls refetchMarginProfit and updateSubscreen', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { providers: mockData } }
      })
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
        />
      )

      const submitButton = screen.getByRole('button', { name: /guardar configuración/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRefetchMarginProfit).toHaveBeenCalled()
        expect(mockUpdateSubscreen).toHaveBeenCalledWith('view')
      })
    })
  })

  describe('Given the form has validation errors', () => {
    it('When courier error is present, Then it displays the error message', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
          data={[]}
        />
      )

      const submitButton = screen.getByRole('button', { name: /guardar configuración/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/debe agregar al menos una paquetería/i)).toBeInTheDocument()
      })

      // Check that the error is displayed in a red card
      const errorCard = screen.getByText(/debe agregar al menos una paquetería/i).closest('div')
      expect(errorCard).toHaveClass('text-red-500')
    })

    it('When courier forms are removed, Then the empty state is shown', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
          updateSubscreen={mockUpdateSubscreen}
        />
      )

      // Initially should have courier forms from mock data - check for actual Fedex heading
      expect(screen.getByRole('heading', { name: /fedex/i })).toBeInTheDocument()
      
      // Remove the courier form - find the remove button by data-testid
      const removeButtons = screen.getAllByTestId(/remove-courier/)
      await user.click(removeButtons[0])
      await user.click(removeButtons[1])

      // Should show empty state
      expect(screen.getByText(/no ha agregado ninguna paquetería/i)).toBeInTheDocument()
    })
  })
})