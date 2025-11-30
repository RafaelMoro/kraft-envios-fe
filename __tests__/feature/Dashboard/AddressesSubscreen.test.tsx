import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper"
import { AddressesSubscreen } from "@/features/Dashboard/subscreens/AddressesSubscreen"
import { LoginData } from "@/shared/types/login.types"

const AddressesSubscreenWrapper = ({
  userInfo
}: {
  userInfo: LoginData | null
}) => {
  return (
    <QueryProviderWrapper>
      <AddressesSubscreen userInfo={userInfo} />
    </QueryProviderWrapper>
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

describe('Feature: Addresses Subscreen', () => {
  describe('Scenario: Display welcome message with user name', () => {
    it('Given a logged-in user, When the subscreen renders, Then it should display the welcome message with user name', () => {
      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.getByText(/bienvenido juan/i)).toBeInTheDocument()
      expect(screen.getByText(/aquí puedes gestionar las direcciones/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display create address button', () => {
    it('Given the subscreen is rendered, When the component loads, Then it should display the create address button', () => {
      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.getByRole('button', { name: /crear dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Open create address modal when button is clicked', () => {
    it('Given the subscreen is rendered, When the user clicks the create address button, Then the create address modal should be displayed', async () => {
      const user = userEvent.setup()

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
    it('Given userInfo is null, When the subscreen renders, Then it should display the welcome message without a name', () => {
      render(<AddressesSubscreenWrapper userInfo={null} />)

      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear dirección/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Notification is not displayed initially', () => {
    it('Given the subscreen is rendered, When the component loads, Then no notification should be displayed', () => {
      render(<AddressesSubscreenWrapper userInfo={mockUserInfo} />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
