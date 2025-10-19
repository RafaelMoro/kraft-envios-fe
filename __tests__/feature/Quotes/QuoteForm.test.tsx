import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
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
    resetFiltersQuotes: jest.fn(),
    updatePackageDimensions: jest.fn()
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

  describe('Volumetric weight functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('Given dimension inputs are filled, When values change, Then volumetric weight should be calculated and displayed after 500ms', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)

      // Fill in dimensions (10cm x 10cm x 10cm = 1000cm³ / 5000 = 0.2kg volumetric weight)
      await user.type(lengthInput, '10')
      await user.type(heightInput, '10')
      await user.type(widthInput, '10')

      // Fast-forward time by 500ms to trigger the debounced calculation
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(screen.getByText(/Peso Volumétrico: 0\.20 kg/i)).toBeInTheDocument()
      })
    })

    it('Given dimensions and weight are provided, When both values exist, Then both masa weight and volumetric weight should be displayed with the higher value as quote weight', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)
      const weightInput = screen.getByLabelText(/Peso/i)

      // Fill in dimensions and weight
      // Dimensions: 20cm x 15cm x 10cm = 3000cm³ / 5000 = 0.6kg volumetric weight
      // Weight: 2kg (higher than volumetric, so should be used for quote)
      await user.type(lengthInput, '20')
      await user.type(heightInput, '15')
      await user.type(widthInput, '10')
      await user.type(weightInput, '2')

      // Fast-forward time by 500ms to trigger the debounced calculation
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        const weightInfo = screen.getByText(/Peso Masa: 2\.00 kg \| Peso Volumétrico: 0\.60 kg \| Peso a cotizar: 2\.00 kg/i)
        expect(weightInfo).toBeInTheDocument()
      })
    })

    it('Given dimensions and weight are provided, When volumetric weight is higher, Then volumetric weight should be used for quote calculation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)
      const weightInput = screen.getByLabelText(/Peso/i)

      // Fill in dimensions and weight
      // Dimensions: 50cm x 40cm x 30cm = 60000cm³ / 5000 = 12kg volumetric weight
      // Weight: 5kg (lower than volumetric, so volumetric should be used)
      await user.type(lengthInput, '50')
      await user.type(heightInput, '40')
      await user.type(widthInput, '30')
      await user.type(weightInput, '5')

      // Fast-forward time by 500ms to trigger the debounced calculation
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        const weightInfo = screen.getByText(/Peso Masa: 5\.00 kg \| Peso Volumétrico: 12\.00 kg \| Peso a cotizar: 12\.00 kg/i)
        expect(weightInfo).toBeInTheDocument()
      })
    })

    it('Given only dimensions are provided without weight, When volumetric weight is calculated, Then only volumetric and quote weight should be shown', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)

      // Fill in only dimensions (25cm x 20cm x 15cm = 7500cm³ / 5000 = 1.5kg volumetric weight)
      await user.type(lengthInput, '25')
      await user.type(heightInput, '20')
      await user.type(widthInput, '15')

      // Fast-forward time by 500ms to trigger the debounced calculation
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        const weightInfo = screen.getByText(/Peso Volumétrico: 1\.50 kg \| Peso a cotizar: 1\.50 kg/i)
        expect(weightInfo).toBeInTheDocument()
        
        // Should not show "Peso Masa" when weight is not provided
        expect(screen.queryByText(/Peso Masa:/i)).not.toBeInTheDocument()
      })
    })

    it('Given dimensions are cleared, When any dimension becomes empty, Then volumetric weight display should be hidden', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)

      // First fill in dimensions to show volumetric weight
      await user.type(lengthInput, '10')
      await user.type(heightInput, '10')
      await user.type(widthInput, '10')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(screen.getByText(/Peso Volumétrico:/i)).toBeInTheDocument()
      })

      // Clear one dimension
      await user.clear(lengthInput)

      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(screen.queryByText(/Peso Volumétrico:/i)).not.toBeInTheDocument()
      })
    })

    it('Given dimension inputs have values, When package type changes to envelope, Then volumetric weight should be recalculated with envelope dimensions', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      // First enter some box dimensions
      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Alto/i)  
      const widthInput = screen.getByLabelText(/Ancho/i)

      await user.type(lengthInput, '20')
      await user.type(heightInput, '20')
      await user.type(widthInput, '20')

      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Verify initial volumetric weight is calculated
      await waitFor(() => {
        expect(screen.getByText(/Peso Volumétrico: 1\.60 kg/i)).toBeInTheDocument()
      })

      // Change to envelope package type
      await user.click(screen.getByText(/Tipo de paquete: Caja de cartón/i))
      await user.click(screen.getByText(/^Sobre$/i))

      // Wait for envelope dimensions to be set and volumetric weight recalculated
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        // Envelope dimensions: 34cm x 27cm x 2cm = 1836cm³ / 5000 = 0.37kg (rounded to 0.37)
        expect(screen.getByText(/Peso Volumétrico: 0\.37 kg/i)).toBeInTheDocument()
      })
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
      await user.type(lengthInput, '20')
      await user.type(heightInput, '15')
      await user.type(widthInput, '25')
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

      // Verify that updatePackageDimensions is called with correct dimensions
      expect(defaultProps.updatePackageDimensions).toHaveBeenCalledWith({
        length: "20",
        height: "15", 
        width: "25",
        weight: "10"
      })
    })

    it('Given form is submitted, When updatePackageDimensions is called, Then it should convert all dimension values to strings', async () => {
      mockedAxios.post.mockResolvedValue({
        error: null,
        message: null,
        success: true,
        version: "v1.2.0",
        data: {
          data: {
            data: {
              quotes: []
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
  
      await user.type(originInput, '54321')
      await user.type(destinationInput, '98765')
      await user.type(weightInput, '1')
      await user.type(lengthInput, '10')
      await user.type(heightInput, '10')
      await user.type(widthInput, '10')
      
      await user.click(screen.getByRole('button', { name: /Cotizar/i }))
  
      // Check that updatePackageDimensions was called with the correct arguments
      expect(defaultProps.updatePackageDimensions).toHaveBeenCalledTimes(1)
      expect(defaultProps.updatePackageDimensions).toHaveBeenCalledWith({
        length: "10",
        height: "10", 
        width: "10",
        weight: "1"
      })
    })

    it('Given "Crear nueva cotización" button is clicked, When clearQuotes is called, Then all reset functions should be called', async () => {
      const user = userEvent.setup()
  
      render(
        <QueryProviderWrapper>
          <QuoteForm {...defaultProps} />
        </QueryProviderWrapper>
      )

      // Fill in some form data first
      const originInput = screen.getByLabelText(/Código Postal de Origen/i)
      const weightInput = screen.getByLabelText(/Peso/i)
      
      await user.type(originInput, '12345')
      await user.type(weightInput, '5')
      
      // Click the "Crear nueva cotización" button
      await user.click(screen.getByRole('button', { name: /Crear nueva cotización/i }))

      // Verify all reset functions were called
      expect(defaultProps.resetSelectedQuotes).toHaveBeenCalledTimes(1)
      expect(defaultProps.resetFiltersQuotes).toHaveBeenCalledTimes(1)
      expect(defaultProps.updateQuotes).toHaveBeenCalledWith([])

      // Verify form was reset - the origin input should be empty
      expect(originInput).toHaveValue('')
      // Note: weight input might have null value after reset, which is acceptable
    })
  })
})
