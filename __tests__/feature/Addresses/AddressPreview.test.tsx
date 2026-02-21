import { render, screen } from '@testing-library/react'
import { AddressPreview } from '@/features/Addresses/AddressPreview'
import { Address } from '@/shared/types/addresses.types'

describe('Feature: AddressPreview', () => {
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

  describe('Scenario: Display address information', () => {
    it('Given a valid address, When the component renders, Then it should display the alias', () => {
      render(<AddressPreview address={mockAddress} />)

      expect(screen.getByRole('heading', { name: 'Casa' })).toBeInTheDocument()
    })

    it('Given a valid address with internal number, When the component renders, Then it should display the complete address including internal number', () => {
      render(<AddressPreview address={mockAddress} />)

      expect(screen.getByText(/Calle Principal, 123, Int\. 4B, Centro, Ciudad de México Cuauhtémoc, CDMX, C\.P\. 06000/)).toBeInTheDocument()
    })

    it('Given an address without internal number, When the component renders, Then it should not display internal number text', () => {
      const addressWithoutInternal: Address = { 
        ...mockAddress, 
        internalNumber: '' 
      }
      
      render(<AddressPreview address={addressWithoutInternal} />)

      expect(screen.getByText(/Calle Principal, 123, Centro, Ciudad de México Cuauhtémoc, CDMX, C\.P\. 06000/)).toBeInTheDocument()
      expect(screen.queryByText(/Int\./)).not.toBeInTheDocument()
    })

    it('Given an address with single city, When the component renders, Then it should display the city name', () => {
      render(<AddressPreview address={mockAddress} />)

      expect(screen.getByText(/Ciudad de México/)).toBeInTheDocument()
    })

    it('Given an address with single town, When the component renders, Then it should display the town name', () => {
      render(<AddressPreview address={mockAddress} />)

      expect(screen.getByText(/Cuauhtémoc/)).toBeInTheDocument()
    })

    it('Given an address with empty city array, When the component renders, Then it should not display city name', () => {
      const addressWithoutCity: Address = { 
        ...mockAddress, 
        city: [] 
      }
      
      render(<AddressPreview address={addressWithoutCity} />)

      expect(screen.getByText(/Calle Principal, 123, Int\. 4B, Centro, Cuauhtémoc, CDMX, C\.P\. 06000/)).toBeInTheDocument()
    })

    it('Given an address with empty town array, When the component renders, Then it should not display town name', () => {
      const addressWithoutTown: Address = { 
        ...mockAddress, 
        town: [] 
      }
      
      render(<AddressPreview address={addressWithoutTown} />)

      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && 
          content.includes('Ciudad de México') && 
          !content.includes('Cuauhtémoc')
      })).toBeInTheDocument()
    })

    it('Given an address with multiple cities, When the component renders, Then it should not display any city', () => {
      const addressWithMultipleCities: Address = { 
        ...mockAddress, 
        city: ['Ciudad de México', 'Guadalajara'] 
      }
      
      render(<AddressPreview address={addressWithMultipleCities} />)

      expect(screen.getByText(/Calle Principal, 123, Int\. 4B, Centro, Cuauhtémoc, CDMX, C\.P\. 06000/)).toBeInTheDocument()
    })

    it('Given an address with multiple towns, When the component renders, Then it should not display any town', () => {
      const addressWithMultipleTowns: Address = { 
        ...mockAddress, 
        town: ['Cuauhtémoc', 'Miguel Hidalgo'] 
      }
      
      render(<AddressPreview address={addressWithMultipleTowns} />)

      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && 
          content.includes('Ciudad de México') && 
          !content.includes('Cuauhtémoc') && 
          !content.includes('Miguel Hidalgo')
      })).toBeInTheDocument()
    })
  })

  describe('Scenario: Semantic structure', () => {
    it('Given the component renders, When checking the structure, Then it should use an article element', () => {
      const { container } = render(<AddressPreview address={mockAddress} />)

      expect(container.querySelector('article')).toBeInTheDocument()
    })
  })
})
