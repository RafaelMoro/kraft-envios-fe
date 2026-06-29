import { CreateGuideAddressFormValuesMn } from '@/shared/types/guides.types'
import { verifyAndUpdateAddressGuideDb } from '@/shared/utils/guides.utils'

const baseAddress: CreateGuideAddressFormValuesMn = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Pérez',
  phone: '5551234567',
  email: '',
  company: '',
  street1: 'Calle 1',
  external_number: '123',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtémoc',
  state: 'CDMX',
  zipcode: '06000',
  reference: 'Frente al parque',
}

describe('verifyAndUpdateAddressGuideDb', () => {
  describe('Given an address with empty email and company', () => {
    it('When verified, Then it fills email with DEFAULT_EMAIL and company with DEFAULT_COMPANY', () => {
      const result = verifyAndUpdateAddressGuideDb({ ...baseAddress, email: '', company: '' })
      expect(result.email).toBe(process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com')
      expect(result.company).toBe('Kraft Envios')
    })
  })

  describe('Given an address with filled email and company', () => {
    it('When verified, Then it preserves the user-supplied email and company', () => {
      const result = verifyAndUpdateAddressGuideDb({
        ...baseAddress,
        email: 'juan@example.com',
        company: 'Mi Empresa',
      })
      expect(result.email).toBe('juan@example.com')
      expect(result.company).toBe('Mi Empresa')
    })
  })

  describe('Given whitespace-only email and company', () => {
    it('When verified, Then it trims and falls back to defaults when empty', () => {
      const result = verifyAndUpdateAddressGuideDb({
        ...baseAddress,
        email: '   ',
        company: '   ',
      })
      expect(result.email).toBe(process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com')
      expect(result.company).toBe('Kraft Envios')
    })
  })

  describe('Given a name and lastName', () => {
    it('When verified, Then the payload name combines name + lastName with a single space', () => {
      const result = verifyAndUpdateAddressGuideDb(baseAddress)
      expect(result.name).toBe('Juan Pérez')
    })

    it('When lastName is empty, Then the payload name is just the name trimmed', () => {
      const result = verifyAndUpdateAddressGuideDb({ ...baseAddress, lastName: '' })
      expect(result.name).toBe('Juan')
    })
  })

  describe('Given the address regardless of inputs', () => {
    it('When verified, Then the result only contains the five verified personal/contact fields', () => {
      const result = verifyAndUpdateAddressGuideDb(baseAddress)
      expect(Object.keys(result).sort()).toEqual(
        ['company', 'email', 'lastName', 'name', 'phone'].sort(),
      )
    })
  })
})
