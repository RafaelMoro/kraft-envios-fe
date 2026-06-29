import {
  CreateGuideDbFormValues,
  PackageDimensions,
  SearchProduct,
} from '@/shared/types/guides.types'
import { toGuideDbParcelPayload } from '@/shared/utils/guides.utils'

const selectedProduct: SearchProduct = {
  code: 'SAT-CODE',
  description: 'Documentos y papelería',
}

const baseParcelInfo: CreateGuideDbFormValues['parcelInfo'] = {
  content: 'Documentos importantes',
  value: '',
  quantity: '',
  notifyMe: false,
}

const baseDimensions: PackageDimensions = {
  length: '20',
  width: '15',
  height: '10',
  weight: '2',
}

describe('toGuideDbParcelPayload', () => {
  describe('Given valid package dimensions', () => {
    it('When all dimensions are stringified numbers, Then it converts them to numbers', () => {
      const result = toGuideDbParcelPayload(baseDimensions, baseParcelInfo, selectedProduct.code)
      expect(result).toEqual({
        length: 20,
        width: 15,
        height: 10,
        weight: 2,
        content: 'Documentos importantes',
        satProductId: 'SAT-CODE',
      })
    })

    it('When value and quantity are empty strings, Then they are omitted from the payload', () => {
      const result = toGuideDbParcelPayload(baseDimensions, baseParcelInfo, selectedProduct.code)
      expect(result).not.toHaveProperty('value')
      expect(result).not.toHaveProperty('quantity')
    })

    it('When value and quantity are non-empty, Then they are included as numbers', () => {
      const result = toGuideDbParcelPayload(
        baseDimensions,
        { ...baseParcelInfo, value: '1500', quantity: '2' },
        selectedProduct.code,
      )
      expect(result?.value).toBe(1500)
      expect(result?.quantity).toBe(2)
    })

    it('When value is non-numeric, Then it is omitted (not coerced)', () => {
      const result = toGuideDbParcelPayload(
        baseDimensions,
        { ...baseParcelInfo, value: 'abc' },
        selectedProduct.code,
      )
      expect(result).not.toHaveProperty('value')
    })
  })

  describe('Given invalid package dimensions', () => {
    it('When packageDimensions is null, Then it returns null to block submit', () => {
      const result = toGuideDbParcelPayload(null, baseParcelInfo, selectedProduct.code)
      expect(result).toBeNull()
    })

    it('When any dimension is not a finite number, Then it returns null', () => {
      const result = toGuideDbParcelPayload(
        { ...baseDimensions, weight: 'not-a-number' },
        baseParcelInfo,
        selectedProduct.code,
      )
      expect(result).toBeNull()
    })

    it('When a dimension is empty string, Then it returns null', () => {
      const result = toGuideDbParcelPayload(
        { ...baseDimensions, height: '' },
        baseParcelInfo,
        selectedProduct.code,
      )
      expect(result).toBeNull()
    })
  })
})
