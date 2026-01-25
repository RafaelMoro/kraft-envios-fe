import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ResultCreateAddress } from '@/features/Addresses/ResultCreateAddress'

const mockToggleModal = jest.fn()

describe('Feature: Result Create Address', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Success state', () => {
    it('Given the address was created successfully, When the component renders, Then it should display success message', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} />)

      expect(screen.getByText(/¡perfecto! dirección añadida correctamente\./i)).toBeInTheDocument()
    })

    it('Given the address was created successfully, When the component renders, Then it should display both success icons', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} />)

      expect(screen.getByText(/dirección añadida en el sistema/i)).toBeInTheDocument()
      expect(screen.getByText(/dirección añadida en ge/i)).toBeInTheDocument()
    })

    it('Given the address was created successfully, When the component renders, Then it should not display error message', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} />)

      expect(screen.queryByText(/para volver a intentarlo/i)).not.toBeInTheDocument()
    })

    it('Given the address was created successfully, When the component renders, Then it should display the action button', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} />)

      expect(screen.getByRole('button', { name: /listo/i })).toBeInTheDocument()
    })

    it('Given the component is rendered, When the user clicks the Listo button, Then it should call toggleModal', async () => {
      const user = userEvent.setup()
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} />)

      const listoButton = screen.getByRole('button', { name: /listo/i })
      await user.click(listoButton)

      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Error state', () => {
    it('Given there was an error creating the address in GE, When the component renders, Then it should display error title', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={true} />)

      expect(screen.getByText(/¡ups! ocurrió un problema al añadir la dirección\./i)).toBeInTheDocument()
    })

    it('Given there was an error creating the address in GE, When the component renders, Then it should display both list items', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={true} />)

      expect(screen.getByText(/dirección añadida en el sistema/i)).toBeInTheDocument()
      expect(screen.getByText(/dirección añadida en ge/i)).toBeInTheDocument()
    })

    it('Given there was an error creating the address in GE, When the component renders, Then it should display error instructions', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={true} />)

      expect(screen.getByText(/para volver a intentarlo, ve en el menú "direcciones" en el apartado de "direcciones pendientes por crear en ge"\./i)).toBeInTheDocument()
    })

    it('Given there was an error creating the address in GE, When the component renders, Then it should display the action button', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={true} />)

      expect(screen.getByRole('button', { name: /listo/i })).toBeInTheDocument()
    })

    it('Given the component is rendered with error, When the user clicks the Listo button, Then it should call toggleModal', async () => {
      const user = userEvent.setup()
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={true} />)

      const listoButton = screen.getByRole('button', { name: /listo/i })
      await user.click(listoButton)

      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Explicit false error state', () => {
    it('Given showErrorCreateAddressGe is explicitly false, When the component renders, Then it should display success message', () => {
      render(<ResultCreateAddress toggleModal={mockToggleModal} isEdit={false} showErrorCreateAddressGe={false} />)

      expect(screen.getByText(/¡perfecto! dirección añadida correctamente\./i)).toBeInTheDocument()
      expect(screen.queryByText(/para volver a intentarlo/i)).not.toBeInTheDocument()
    })
  })
})
