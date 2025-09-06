import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { CourierProfitMarginForm } from '@/features/ProfitMargin/CourierProfitMarginForm'

// Mock the icons to avoid issues with SVG imports
jest.mock('@remixicon/react', () => ({
  RiArchiveLine: () => <div data-testid="archive-icon" />,
  RiArrowDownSLine: () => <div data-testid="arrow-down-icon" />,
  RiDeleteBinLine: () => <div data-testid="delete-icon" />
}))

const mockProps = {
  id: 'test-courier-id',
  courierFormsDataLoaded: null,
  onRemove: jest.fn(),
  changeCourier: jest.fn(),
  updateValue: jest.fn(),
  updateProfitMarginType: jest.fn()
}

const mockPropsWithData = {
  ...mockProps,
  courierFormsDataLoaded: {
    id: 'test-courier-id',
    courier: 'DHL' as const,
    value: 15,
    profitMarginType: {
      label: 'Absoluto',
      value: 'absolute' as const
    }
  }
}

describe('CourierProfitMarginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any existing timers
    jest.clearAllTimers()
  })

  afterEach(() => {
    // Ensure we always restore real timers after each test if they were set to fake
    try {
      if (jest.isMockFunction(setTimeout)) {
        jest.useRealTimers()
      }
    } catch {
      // Timer functions are not mocked, nothing to restore
    }
  })

  describe('Given the CourierProfitMarginForm component is rendered', () => {
    it('When component loads with default props, Then it displays all required elements', () => {
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: Component renders with default values
      expect(screen.getByRole('heading', { name: 'Fedex' })).toBeInTheDocument() // Default courier in header
      expect(screen.getByText('Paquetería:')).toBeInTheDocument()
      expect(screen.getByLabelText('Valor')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /porcentaje/i })).toBeInTheDocument() // Default profit margin type
      expect(screen.getByTestId(`remove-courier-${mockProps.id}`)).toBeInTheDocument()
    })

    it('When component loads with existing data, Then it displays the loaded values', () => {
      render(<CourierProfitMarginForm {...mockPropsWithData} />)

      // Scenario: Component renders with existing data
      expect(screen.getByRole('heading', { name: 'DHL' })).toBeInTheDocument() // Loaded courier in header
      expect(screen.getByDisplayValue('15')).toBeInTheDocument() // Loaded value
      expect(screen.getByRole('button', { name: /absoluto/i })).toBeInTheDocument() // Loaded profit margin type
    })
  })

  describe('Given the user interacts with the courier selection', () => {
    it('When the courier dropdown is clicked, Then it shows all available couriers', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User clicks on courier dropdown
      const courierButton = screen.getByRole('button', { name: /fedex/i })
      await user.click(courierButton)

      // Then: All couriers should be available (check for specific couriers to avoid duplicates)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Estafeta' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'DHL' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'UPS' })).toBeInTheDocument()
      })
    })

    it('When a new courier is selected, Then it updates the courier and calls changeCourier', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User selects a different courier
      const courierButton = screen.getByRole('button', { name: /fedex/i })
      await user.click(courierButton)

      const dhlOption = await screen.findByRole('button', { name: 'DHL' })
      await user.click(dhlOption)

      // Then: Should call changeCourier with new courier
      expect(mockProps.changeCourier).toHaveBeenCalledWith('DHL', mockProps.id)
    })
  })

  describe('Given the user interacts with the value input', () => {
    it('When user types in value input, Then it debounces the update after 500ms', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User types a value
      const valueInput = screen.getByTestId(`profit-margin-value-${mockProps.id}`)
      await user.type(valueInput, '25')

      // Then: updateValue should not be called immediately
      expect(mockProps.updateValue).not.toHaveBeenCalled()

      // When: 500ms pass
      jest.advanceTimersByTime(500)

      // Then: updateValue should be called with the typed value
      await waitFor(() => {
        expect(mockProps.updateValue).toHaveBeenCalledWith(25, mockProps.id)
      })

      jest.useRealTimers()
    })

    it('When user types rapidly, Then only the last value is processed after debounce', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User types multiple values rapidly
      const valueInput = screen.getByTestId(`profit-margin-value-${mockProps.id}`)
      
      await user.clear(valueInput)
      await user.type(valueInput, '10')
      
      jest.advanceTimersByTime(100) // Don't wait full debounce
      
      await user.clear(valueInput)
      await user.type(valueInput, '25')

      // When: Full debounce time passes
      jest.advanceTimersByTime(500)

      // Then: Should only be called once with the final value
      await waitFor(() => {
        expect(mockProps.updateValue).toHaveBeenCalledTimes(1)
        expect(mockProps.updateValue).toHaveBeenCalledWith(25, mockProps.id)
      })

      jest.useRealTimers()
    })

    it('When user clears the input, Then it calls updateValue with null', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CourierProfitMarginForm {...mockPropsWithData} />)

      // Scenario: User clears the input
      const valueInput = screen.getByTestId(`profit-margin-value-${mockProps.id}`)
      await user.clear(valueInput)

      // When: Debounce time passes
      jest.advanceTimersByTime(500)

      // Then: Should call updateValue with null
      await waitFor(() => {
        expect(mockProps.updateValue).toHaveBeenCalledWith(null, mockProps.id)
      })

      jest.useRealTimers()
    })
  })

  describe('Given the user interacts with the profit margin type', () => {
    it('When the profit margin type dropdown is clicked, Then it shows percentage and absolute options', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User clicks on profit margin type dropdown
      const profitMarginButton = screen.getByRole('button', { name: /porcentaje/i })
      await user.click(profitMarginButton)

      // Then: Both options should be available (look for menuitem roles specifically)
      await waitFor(() => {
        const dropdownItems = screen.getAllByRole('menuitem')
        expect(dropdownItems).toHaveLength(2)
        expect(screen.getAllByText('Porcentaje')).toHaveLength(2)
        expect(screen.getByText('Absoluto')).toBeInTheDocument()
      })
    })

    it('When percentage option is selected, Then it updates to percentage type', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockPropsWithData} />) // Starts with 'Absoluto'

      // Scenario: User selects percentage
      const profitMarginButton = screen.getByRole('button', { name: /absoluto/i })
      await user.click(profitMarginButton)

      const percentageOption = await screen.findByRole('button', { name: 'Porcentaje' })
      await user.click(percentageOption)

      // Then: Should call updateProfitMarginType with percentage
      expect(mockProps.updateProfitMarginType).toHaveBeenCalledWith('percentage', mockProps.id)
    })

    it('When absolute option is selected, Then it updates to absolute type', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockProps} />) // Starts with 'Porcentaje'

      // Scenario: User selects absolute
      const profitMarginButton = screen.getByRole('button', { name: /porcentaje/i })
      await user.click(profitMarginButton)

      const absoluteOption = await screen.findByRole('button', { name: 'Absoluto' })
      await user.click(absoluteOption)

      // Then: Should call updateProfitMarginType with absolute
      expect(mockProps.updateProfitMarginType).toHaveBeenCalledWith('absolute', mockProps.id)
    })
  })

  describe('Given the user wants to remove the courier form', () => {
    it('When the remove button is clicked, Then it calls onRemove with the id', async () => {
      const user = userEvent.setup()
      render(<CourierProfitMarginForm {...mockProps} />)

      // Scenario: User clicks remove button
      const removeButton = screen.getByTestId(`remove-courier-${mockProps.id}`)
      await user.click(removeButton)

      // Then: Should call onRemove with the correct id
      expect(mockProps.onRemove).toHaveBeenCalledWith(mockProps.id)
    })
  })
})
