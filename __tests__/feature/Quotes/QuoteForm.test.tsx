import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios';

import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { QuoteForm } from '@/features/Quotes/QuoteForm'

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('QuoteForm', () => {
  const defaultProps = {
    updateQuotes: jest.fn(),
    resetSelectedQuotes: jest.fn(),
    resetFiltersQuotes: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Show the fields needed for the quote form', () => {
    render(
      <QueryProviderWrapper>
        <QuoteForm {...defaultProps} />
      </QueryProviderWrapper>
    )

    // Address fields
    expect(screen.getByLabelText(/Código Postal de Origen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código Postal de Destino/i)).toBeInTheDocument()

    // Package fields
    expect(screen.getByLabelText(/Peso/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Largo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Alto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ancho/i)).toBeInTheDocument()

    // Submit button
    expect(screen.getByRole('button', { name: /Cotizar/i })).toBeInTheDocument()
    // New clear button
    expect(screen.getByRole('button', { name: /Crear nueva cotización/i })).toBeInTheDocument()
  })

  describe('Form validation', () => {
    it('shows required field errors when submitting empty form', async () => {
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const user = userEvent.setup()
      
      // Submit form without filling any fields
      await user.click(screen.getByRole('button', { name: /Cotizar/i }))

      await waitFor(() => {
        expect(screen.getByText(/La dirección postal de origen es requerida/i)).toBeInTheDocument()
        expect(screen.getByText(/La dirección postal de destino es requerida/i)).toBeInTheDocument()
      })
    })

    it('shows specific validation messages for postal code length and numeric min', async () => {
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const user = userEvent.setup()

      // enter invalid short postal code and zero weight
      await user.type(screen.getByLabelText(/Código Postal de Origen/i), '123')
      await user.type(screen.getByLabelText(/Código Postal de Destino/i), '123')
      await user.type(screen.getByLabelText(/Peso/i), '0')
      await user.type(screen.getByLabelText(/Largo/i), '0')
      await user.type(screen.getByLabelText(/Alto/i), '0')
      await user.type(screen.getByLabelText(/Ancho/i), '0')

      await user.click(screen.getByRole('button', { name: /Cotizar/i }))

      await waitFor(() => {
        expect(screen.getByText(/La dirección postal de origen debe tener 5 caracteres/i)).toBeInTheDocument()
        expect(screen.getByText(/La dirección postal de destino debe tener 5 caracteres/i)).toBeInTheDocument()
        expect(screen.getByText(/El peso debe ser mayor que 0/i)).toBeInTheDocument()
        expect(screen.getByText(/El largo debe ser mayor que 0/i)).toBeInTheDocument()
        expect(screen.getByText(/La altura debe ser mayor que 0/i)).toBeInTheDocument()
        expect(screen.getByText(/El ancho debe ser mayor que 0/i)).toBeInTheDocument()
      })
    })
  })

  describe('Package type functionality', () => {
    it('When envelope package type is selected, Then default envelope dimensions should be set', async () => {
      const user = userEvent.setup()
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      // Initially the package type should be "Caja de cartón" (box)
      expect(screen.getByText(/Tipo de paquete: Caja de cartón/i)).toBeInTheDocument()

      // Click on the dropdown to open it
      await user.click(screen.getByText(/Tipo de paquete: Caja de cartón/i))

      // Select "Sobre" (envelope) option
      await user.click(screen.getByText(/^Sobre$/i))

      // Wait for the dropdown label to update
      await waitFor(() => {
        expect(screen.getByText(/Tipo de paquete: Sobre/i)).toBeInTheDocument()
      })

      // Verify that the dimension inputs have the default envelope values
      const lengthInput = screen.getByLabelText(/Largo/i) as HTMLInputElement
      const heightInput = screen.getByLabelText(/Alto/i) as HTMLInputElement  
      const widthInput = screen.getByLabelText(/Ancho/i) as HTMLInputElement

      expect(lengthInput.value).toBe('34')  // DEFAULT_ENVELOPE_LENGTH
      expect(heightInput.value).toBe('27')  // DEFAULT_ENVELOPE_HEIGHT
      expect(widthInput.value).toBe('2')    // DEFAULT_ENVELOPE_WIDTH
    })

    it('When box package type is selected after envelope, Then dimension inputs should be cleared', async () => {
      const user = userEvent.setup()
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      // First select envelope to set default values
      await user.click(screen.getByText(/Tipo de paquete: Caja de cartón/i))
      await user.click(screen.getByText(/^Sobre$/i))

      // Wait for envelope selection and verify values are set
      await waitFor(() => {
        expect(screen.getByText(/Tipo de paquete: Sobre/i)).toBeInTheDocument()
      })

      // Now select box again
      await user.click(screen.getByText(/Tipo de paquete: Sobre/i))
      await user.click(screen.getByText(/^Caja de cartón$/i))

      // Wait for box selection
      await waitFor(() => {
        expect(screen.getByText(/Tipo de paquete: Caja de cartón/i)).toBeInTheDocument()
      })

      // Verify that the dimension inputs are cleared
      const lengthInput = screen.getByLabelText(/Largo/i) as HTMLInputElement
      const heightInput = screen.getByLabelText(/Alto/i) as HTMLInputElement  
      const widthInput = screen.getByLabelText(/Ancho/i) as HTMLInputElement

      expect(lengthInput.value).toBe('')
      expect(heightInput.value).toBe('')
      expect(widthInput.value).toBe('')
    })
  })

  describe('Form submission', () => {
    it('Submit successfully the quote form', async () => {
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: null,
        success: true,
        version: "v1.2.0",
        data: {
          data: {
            data: {
              quotes: [
                {
                  "id": "a48f570d-b45d-489f-99a3-5cfb266db69e",
                  "service": "Estafeta Terrestre c/Recolección",
                  "total": 225,
                  "source": "GE"
                }
              ]
            }
          }
        }
      })
      const user = userEvent.setup()
  
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )
  
      const originInput = screen.getByLabelText(/Código Postal de Origen/i)
      const destinationInput = screen.getByLabelText(/Código Postal de Destino/i)
      const weightInput = screen.getByLabelText(/Peso/i)
      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)
      const widthInput = screen.getByLabelText(/Ancho/i)
  
      await user.type(originInput, '12345')
      await user.type(destinationInput, '12345')
      await user.type(weightInput, '10')
      await user.type(lengthInput, '10')
      await user.type(heightInput, '10')
      await user.type(widthInput, '10')
      await user.click(screen.getByRole('button', { name: /Cotizar/i }))
  
      await waitFor(() => {
        expect(defaultProps.updateQuotes).toHaveBeenCalledWith(
          [
            {
              "id": "a48f570d-b45d-489f-99a3-5cfb266db69e",
              "service": "Estafeta Terrestre c/Recolección",
              "source": "GE",
              "total": 225
            }
          ]
        )
      })
    })
  })
})
