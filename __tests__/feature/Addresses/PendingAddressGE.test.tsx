import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { useMutation } from '@tanstack/react-query'

import { PendingAddressGE } from "@/features/Addresses/PendingAddressGE"
import { CreateAddressGEPayload } from "@/shared/types/guides.types"
import * as addressUtils from '../../../src/shared/utils/addresses.utils'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn()
}))

jest.mock('../../../src/shared/utils/addresses.utils', () => ({
  ...jest.requireActual('../../../src/shared/utils/addresses.utils'),
  removeAddressFromLocalStorage: jest.fn()
}))

const mockAddress: CreateAddressGEPayload = {
  alias: 'Casa Principal',
  street: 'Calle Reforma',
  number: '123',
  neighborhood: 'Centro',
  city: 'CDMX',
  state: 'Ciudad de México',
  zipcode: '06000',
  name: 'Juan Pérez',
  lastName: 'García',
  phone: '5512345678',
  email: 'juan@example.com'
}

describe('Feature: Pending Address GE Card', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Scenario: Display pending address information', () => {
    it('Given a pending address, When the component renders, Then it should display the address details', () => {
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isSuccess: false
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      expect(screen.getByText('Casa Principal')).toBeInTheDocument()
      expect(screen.getByText(/calle reforma 123, centro, cdmx ciudad de méxico, c\.p\. 06000/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /volver a intentar/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Retry creating address in GE', () => {
    it('Given a pending address, When the user clicks retry button, Then it should trigger the mutation', async () => {
      const user = userEvent.setup()
      const mutateMock = jest.fn()
      const mockUseMutation = useMutation as jest.Mock

      mockUseMutation.mockReturnValue({
        mutate: mutateMock,
        isPending: false,
        isSuccess: false
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      const retryButton = screen.getByRole('button', { name: /volver a intentar/i })
      await user.click(retryButton)

      expect(mutateMock).toHaveBeenCalledWith(mockAddress)
    })
  })

  describe('Scenario: Display loading state during address creation', () => {
    it('Given the address is being created, When the mutation is pending, Then it should display a spinner and disable the button', () => {
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isSuccess: false
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      expect(screen.getByLabelText(/loading create address ge pending directions/i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.queryByText(/volver a intentar/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display success state after address creation', () => {
    it('Given the address was created successfully, When the mutation succeeds, Then it should display a check icon and disable the button', () => {
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isSuccess: true
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toContainHTML('svg')
      expect(screen.queryByText(/volver a intentar/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Handle successful address creation', () => {
    it('Given the address creation succeeds, When onSuccess callback is triggered, Then it should remove address from localStorage and call onAddressRemoved', async () => {
      const onAddressRemovedMock = jest.fn()
      const removeFromStorageMock = jest.fn().mockResolvedValue(undefined)
      ;(addressUtils.removeAddressFromLocalStorage as jest.Mock).mockImplementation(removeFromStorageMock)

      let capturedOnSuccess: (() => Promise<void>) | undefined

      (useMutation as jest.Mock).mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess
        return {
          mutate: jest.fn(),
          isPending: false,
          isSuccess: false
        }
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={onAddressRemovedMock}
        />
      )

      expect(capturedOnSuccess).toBeDefined()
      
      await capturedOnSuccess!()

      await waitFor(() => {
        expect(removeFromStorageMock).toHaveBeenCalledWith('Casa Principal')
        expect(onAddressRemovedMock).toHaveBeenCalledWith('Casa Principal')
      })
    })
  })

  describe('Scenario: Display error message on creation failure', () => {
    it('Given the address creation fails, When onError callback is triggered, Then it should display error message', async () => {
      let capturedOnError: (() => void) | undefined

      (useMutation as jest.Mock).mockImplementation((config) => {
        capturedOnError = config.onError
        return {
          mutate: jest.fn(),
          isPending: false,
          isSuccess: false
        }
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      expect(capturedOnError).toBeDefined()

      await waitFor(() => {
        capturedOnError!()
      })

      await waitFor(() => {
        expect(screen.getByText(/¡ups! ocurrió un problema al crear la dirección/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Error message disappears after timeout', () => {
    it('Given an error message is displayed, When 3 seconds pass, Then the error message should disappear', async () => {
      jest.useFakeTimers()

      let capturedOnError: (() => void) | undefined

      (useMutation as jest.Mock).mockImplementation((config) => {
        capturedOnError = config.onError
        return {
          mutate: jest.fn(),
          isPending: false,
          isSuccess: false
        }
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      await waitFor(() => {
        capturedOnError!()
      })

      await waitFor(() => {
        expect(screen.getByText(/¡ups! ocurrió un problema al crear la dirección/i)).toBeInTheDocument()
      })

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(screen.queryByText(/¡ups! ocurrió un problema al crear la dirección/i)).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Scenario: Button states prevent multiple submissions', () => {
    it('Given the button is in pending state, When rendered, Then the button should be disabled', () => {
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isSuccess: false
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('Given the button is in success state, When rendered, Then the button should be disabled', () => {
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isSuccess: true
      })

      render(
        <PendingAddressGE
          address={mockAddress}
          onAddressRemoved={jest.fn()}
        />
      )

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
