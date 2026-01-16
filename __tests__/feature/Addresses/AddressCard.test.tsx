import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressCard } from '@/features/Addresses/AddressCard'
import { Address } from '@/shared/types/addresses.types'

describe('Feature: AddressCard', () => {
  const mockAddress: Address = {
    alias: 'Casa',
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '4B',
    neighborhood: 'Centro',
    city: ['Ciudad de México'],
    town: ['Cuauhtémoc'],
    state: 'CDMX',
    zipcode: '06000',
    reference: 'Cerca del parque',
    isGEAddress: false
  }

  const mockHandleDelete = jest.fn()
  const mockHandleEdit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display address information', () => {
    it('Given a valid address, When the component renders, Then it should display all address details', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByText('Casa')).toBeInTheDocument()
      expect(screen.getByText(/Calle Principal, 123, Int\. 4B, Centro, Ciudad de México Cuauhtémoc, CDMX, C\.P\. 06000/)).toBeInTheDocument()
    })

    it('Given an address without internal number, When the component renders, Then it should not display internal number', () => {
      const addressWithoutInternal = { ...mockAddress, internalNumber: "" }
      
      render(
        <AddressCard
          address={addressWithoutInternal}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByText(/Calle Principal, 123, Centro/)).toBeInTheDocument()
      expect(screen.queryByText(/Int\./)).not.toBeInTheDocument()
    })

    it('Given an address with reference, When the component renders, Then it should display the reference', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByText('Referencia')).toBeInTheDocument()
      expect(screen.getByText('Cerca del parque')).toBeInTheDocument()
    })

    it('Given an address without reference, When the component renders, Then it should not display reference section', () => {
      const addressWithoutReference = { ...mockAddress, reference: "" }
      
      render(
        <AddressCard
          address={addressWithoutReference}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.queryByText('Referencia')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: GE Address badge', () => {
    it('Given a GE address, When the component renders, Then it should display GE badge', () => {
      const geAddress = { ...mockAddress, isGEAddress: true }
      
      render(
        <AddressCard
          address={geAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByText('Dirección creada en GE')).toBeInTheDocument()
    })

    it('Given a non-GE address, When the component renders, Then it should not display GE badge', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.queryByText('Dirección creada en GE')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Multiple cities and towns', () => {
    it('Given an address with multiple cities, When the component renders, Then it should display cities badges', () => {
      const addressWithMultipleCities = {
        ...mockAddress,
        city: ['Ciudad de México', 'Guadalajara', 'Monterrey'],
        town: ['Cuauhtémoc', 'Zapopan', 'San Pedro']
      }
      
      render(
        <AddressCard
          address={addressWithMultipleCities}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByText('Ciudades')).toBeInTheDocument()
      expect(screen.getByText('Ciudad de México')).toBeInTheDocument()
      expect(screen.getByText('Guadalajara')).toBeInTheDocument()
      expect(screen.getByText('Monterrey')).toBeInTheDocument()

      expect(screen.getByText('Municipios')).toBeInTheDocument()
      expect(screen.getByText('Cuauhtémoc')).toBeInTheDocument()
      expect(screen.getByText('Zapopan')).toBeInTheDocument()
      expect(screen.getByText('San Pedro')).toBeInTheDocument()
    })

    it('Given an address with single city and town, When the component renders, Then it should display them inline', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.queryByText('Ciudades')).not.toBeInTheDocument()
      expect(screen.queryByText('Municipios')).not.toBeInTheDocument()
      expect(screen.getByText(/Ciudad de México Cuauhtémoc/)).toBeInTheDocument()
    })
  })

  describe('Scenario: User interactions', () => {
    it('Given the edit button, When user clicks it, Then it should call handleEditAddress with the address', async () => {
      const user = userEvent.setup()
      
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      const editButton = screen.getByRole('button', { name: /editar/i })
      await user.click(editButton)

      expect(mockHandleEdit).toHaveBeenCalledTimes(1)
      expect(mockHandleEdit).toHaveBeenCalledWith(mockAddress)
    })

    it('Given the delete button, When user clicks it, Then it should call handleDeleteAddress with the address', async () => {
      const user = userEvent.setup()
      
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      expect(mockHandleDelete).toHaveBeenCalledTimes(1)
      expect(mockHandleDelete).toHaveBeenCalledWith(mockAddress)
    })
  })

  describe('Scenario: Card structure', () => {
    it('Given the component, When it renders, Then it should display the address icon', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })

    it('Given the component, When it renders, Then it should have both action buttons', () => {
      render(
        <AddressCard
          address={mockAddress}
          handleDeleteAddress={mockHandleDelete}
          handleEditAddress={mockHandleEdit}
        />
      )

      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })
  })
})
