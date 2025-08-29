import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import axios from 'axios'

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { ProfitMarginForm } from "@/features/ProfitMargin/ProfitMarginForm"
import { AppRouterContextProviderMock } from "@/features/AppRouterContextProviderMock"

const ProfitMarginFormWrapper = ({
  push,
  refetchMarginProfit,
}: {
  push: () => void
  refetchMarginProfit: () => Promise<void>
}) => {
  return (
    <QueryProviderWrapper>
      <AppRouterContextProviderMock router={{ push }}>
        <ProfitMarginForm refetchMarginProfit={refetchMarginProfit} />
      </AppRouterContextProviderMock>
    </QueryProviderWrapper>
  )
}

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ProfitMarginForm', () => {
  const mockRefetchMarginProfit = jest.fn()
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
        />
      )

      expect(screen.getByRole('heading', { name: /actualizar margen de ganancia/i })).toBeInTheDocument()
      expect(screen.getByText(/ingrese los siguientes datos para actualizar el margen de ganancia/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tipo: porcentaje/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /actualizar margen/i })).toBeInTheDocument()
    })

    it('When the value input has default value, Then it shows 0', () => {
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      expect(valueInput).toHaveValue(0)
    })

    it('When the profit margin type dropdown is clicked, Then it shows both type options', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const typeDropdown = screen.getByRole('button', { name: /tipo: porcentaje/i })
      await user.click(typeDropdown)

      expect(screen.getByText('Porcentaje')).toBeInTheDocument()
      expect(screen.getByText('Absoluto')).toBeInTheDocument()
    })
  })

  describe('Given the user interacts with the form', () => {
    it('When the user enters a valid value, Then the input updates correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '15')

      expect(valueInput).toHaveValue(15)
    })

    it('When the user selects "Absoluto" from dropdown, Then the dropdown label changes', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const typeDropdown = screen.getByRole('button', { name: /tipo: porcentaje/i })
      await user.click(typeDropdown)
      
      const absoluteOption = screen.getByText('Absoluto')
      await user.click(absoluteOption)

      expect(screen.getByRole('button', { name: /tipo: absoluto/i })).toBeInTheDocument()
    })

    it('When the user selects "Porcentaje" after selecting "Absoluto", Then the dropdown label changes back', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      // First select Absoluto
      const typeDropdown = screen.getByRole('button', { name: /tipo: porcentaje/i })
      await user.click(typeDropdown)
      const absoluteOption = screen.getByText('Absoluto')
      await user.click(absoluteOption)

      // Then select Porcentaje again
      const updatedDropdown = screen.getByRole('button', { name: /tipo: absoluto/i })
      await user.click(updatedDropdown)
      const percentageOption = screen.getByText('Porcentaje')
      await user.click(percentageOption)

      expect(screen.getByRole('button', { name: /tipo: porcentaje/i })).toBeInTheDocument()
    })
  })

  describe('Given the user submits the form', () => {
    it('When the form is submitted with valid data and percentage type, Then it calls the API with correct payload', async () => {
      const user = userEvent.setup()
      const mockProfitMargin = { value: 15, type: 'percentage' }
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: mockProfitMargin } } }
      })
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '15')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {
            profitMargin: {
              value: 15,
              type: 'percentage'
            }
          }
        )
      })
    })

    it('When the form is submitted with valid data and absolute type, Then it calls the API with correct payload', async () => {
      const user = userEvent.setup()
      const mockProfitMargin = { value: 50, type: 'absolute' }
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: mockProfitMargin } } }
      })
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      // Change type to absolute
      const typeDropdown = screen.getByRole('button', { name: /tipo: porcentaje/i })
      await user.click(typeDropdown)
      const absoluteOption = screen.getByText('Absoluto')
      await user.click(absoluteOption)

      // Enter value
      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '50')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {
            profitMargin: {
              value: 50,
              type: 'absolute'
            }
          }
        )
      })
    })

    it('When the form is submitted successfully, Then it calls refetchMarginProfit', async () => {
      const user = userEvent.setup()
      const mockProfitMargin = { value: 15, type: 'percentage' }
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { data: { profitMargin: mockProfitMargin } } }
      })
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '15')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRefetchMarginProfit).toHaveBeenCalled()
      })
    })

    it('When the form is submitting, Then it shows loading spinner and disables submit button', async () => {
      const user = userEvent.setup()
      // Mock a slow response
      mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '15')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      expect(screen.getByLabelText(/loading updating margin profit/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Given the form has validation errors', () => {
    it('When the form is submitted without a value, Then it shows validation error', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/value must be a `number` type/i)).toBeInTheDocument()
      })
    })

    it('When the form is submitted with value 0, Then it shows validation error', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '0')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el valor debe ser mayor que 0/i)).toBeInTheDocument()
      })
    })

    it('When the form is submitted with negative value, Then it shows validation error', async () => {
      const user = userEvent.setup()
      
      render(
        <ProfitMarginFormWrapper
          push={mockPush}
          refetchMarginProfit={mockRefetchMarginProfit}
        />
      )

      const valueInput = screen.getByLabelText(/valor/i)
      await user.clear(valueInput)
      await user.type(valueInput, '-5')

      const submitButton = screen.getByRole('button', { name: /actualizar margen/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el valor debe ser mayor que 0/i)).toBeInTheDocument()
      })
    })
  })
})