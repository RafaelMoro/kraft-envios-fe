import { render, screen } from '@testing-library/react'

import { ParcelInfoFormTone } from '@/features/Guides/Tone/ParcelInfoFormTone'
import { ParcelInfoFormValuesTone } from '@/shared/types/guides.types'

describe('ParcelInfoFormTone', () => {
  const defaultProps = {
    isMobileTablet: false,
    parcelInfo: {
      content: ''
    } as ParcelInfoFormValuesTone,
    goNext: jest.fn(),
    goPrev: jest.fn(),
    updateParcelInfo: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GIVEN ParcelInfoFormTone with basic props', () => {
    it('WHEN component renders THEN form elements should be visible (content input, toggle switch, buttons)', () => {
      render(
        <ParcelInfoFormTone {...defaultProps} />
      )

      // Then content input should be visible
      expect(screen.getByLabelText(/contenido del paquete/i)).toBeInTheDocument()
      
      // Then toggle switch should be visible
      expect(screen.getByLabelText(/notificame/i)).toBeInTheDocument()
      
      // Then navigation buttons should be visible
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
      
      // Then form should have correct structure
      const contentInput = screen.getByLabelText(/contenido del paquete/i)
      expect(contentInput).toHaveAttribute('type', 'text')
      expect(contentInput).toHaveAttribute('id', 'content')
    })
  })
})
