import React from 'react'
import { render, screen } from '@testing-library/react'
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
})
