import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'
import { QuoteForm } from '@/features/Quotes/QuoteForm'

describe('QuoteForm', () => {
  it('Show the fields needed for the quote form', () => {
    const updateQuotes = jest.fn()

    render(
      <QueryProviderWrapper>
        <QuoteForm updateQuotes={updateQuotes} />
      </QueryProviderWrapper>
    )

    // Address fields
    expect(screen.getByLabelText(/Código Postal de Origen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código Postal de Destino/i)).toBeInTheDocument()

    // Package fields
    expect(screen.getByLabelText(/Peso/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Largo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Altura/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ancho/i)).toBeInTheDocument()

    // Submit button
    expect(screen.getByRole('button', { name: /Cotizar/i })).toBeInTheDocument()
  })

  describe('Form validation', () => {
    it('shows required field errors when submitting empty form', async () => {
      const updateQuotes = jest.fn()

      render(
        <QueryProviderWrapper>
          <QuoteForm updateQuotes={updateQuotes} />
        </QueryProviderWrapper>
      )

      const user = userEvent.setup()
      const weightInput = screen.getByLabelText(/Peso/i)
      const lengthInput = screen.getByLabelText(/Largo/i)
      const heightInput = screen.getByLabelText(/Altura/i)
      const widthInput = screen.getByLabelText(/Ancho/i)

      await user.type(weightInput, '0')
      await user.type(lengthInput, '0')
      await user.type(heightInput, '0')
      await user.type(widthInput, '0')
      await user.click(screen.getByRole('button', { name: /Cotizar/i }))

      expect(screen.getByText(/La dirección postal de origen es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/La dirección postal de destino es requerida/i)).toBeInTheDocument()
    })

    it('shows specific validation messages for postal code length and numeric min', async () => {
      const updateQuotes = jest.fn()

      render(
        <QueryProviderWrapper>
          <QuoteForm updateQuotes={updateQuotes} />
        </QueryProviderWrapper>
      )

      const user = userEvent.setup()

      // enter invalid short postal code and zero weight
      await user.type(screen.getByLabelText(/Código Postal de Origen/i), '123')
      await user.type(screen.getByLabelText(/Código Postal de Destino/i), '123')
      await user.type(screen.getByLabelText(/Peso/i), '0')
      await user.type(screen.getByLabelText(/Largo/i), '0')
      await user.type(screen.getByLabelText(/Altura/i), '0')
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
})
