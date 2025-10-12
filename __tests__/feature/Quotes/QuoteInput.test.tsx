import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import { QuoteInput } from '@/features/Quotes/QuoteInput'

// Test wrapper component to provide react-hook-form context
const TestQuoteInputWrapper = ({
  label = 'Test Label',
  inputId = 'testInput',
  inputType = 'text' as const,
  errorMessage,
  isNumericInput = false,
  clearInput = jest.fn()
}: {
  label?: string;
  inputId?: string;
  inputType?: 'text' | 'number';
  errorMessage?: string;
  isNumericInput?: boolean;
  clearInput?: jest.Mock;
}) => {
  const { register } = useForm()
  
  return (
    <QuoteInput
      label={label}
      inputId={inputId}
      inputType={inputType}
      register={register}
      clearInput={clearInput}
      errorMessage={errorMessage}
      isNumericInput={isNumericInput}
    />
  )
}

describe('QuoteInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GIVEN QuoteInput with basic props', () => {
    it('WHEN component renders THEN label should be visible, input should be rendered with correct type and id, and clear button should be present', () => {
      const mockClearInput = jest.fn()
      
      render(
        <TestQuoteInputWrapper
          label="Test Input Label"
          inputId="testField"
          inputType="text"
          clearInput={mockClearInput}
        />
      )

      // Then label should be visible
      expect(screen.getByLabelText(/test input label/i)).toBeInTheDocument()
      
      // Then input should be rendered with correct type and id
      const input = screen.getByLabelText(/test input label/i)
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('id', 'testField')
      
      // Then clear button should be present
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
      
      // Then input should have required attribute
      expect(input).toBeRequired()
    })
  })
})
