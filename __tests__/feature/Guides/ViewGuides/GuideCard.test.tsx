import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { GuideCard } from '@/features/Guides/ViewGuides/GuideCard'
import { GuideUI } from '@/shared/types/guides.types'

const mockGuideComplete: GuideUI = {
  trackingNumber: '1234567890',
  shipmentNumber: 'SH-001',
  status: 'Entregado',
  carrier: 'DHL',
  source: 'GE',
  price: '250.00',
  guideLink: 'https://example.com/guide',
  labelUrl: 'https://example.com/label.pdf',
  file: null,
  courier: 'DHL',
  origin: {
    name: 'Juan Pérez',
    alias: 'Casa Principal',
    street: 'Av. Insurgentes',
    streetNumber: '123',
    neighborhood: 'Roma Norte',
    city: 'Ciudad de México',
    state: 'CDMX'
  },
  destination: {
    name: 'María García',
    alias: 'Oficina Central',
    street: 'Paseo de la Reforma',
    streetNumber: '456',
    neighborhood: 'Juárez',
    city: 'Ciudad de México',
    state: 'CDMX'
  },
  logoSrc: {
    source: '/img/dhl-logo.svg',
    provider: 'dhl',
    width: 90,
    height: 30
  }
}

const mockGuideWithNulls: GuideUI = {
  ...mockGuideComplete,
  courier: null,
  logoSrc: {
    source: '/kraft-logo.svg',
    provider: 'other',
    width: 100,
    height: 50
  }
}

describe('GuideCard', () => {
  describe('Given the GuideCard component is in loading state', () => {
    it('When isPending is true and guide is null, Then it displays the skeleton loader', () => {
      render(<GuideCard guide={null} isPending={true} />)

      expect(screen.getByTestId('guide-card-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Número de Guia')).toBeInTheDocument()
      expect(screen.getByText('Envío:')).toBeInTheDocument()
      expect(screen.getAllByText('Remitente')).toHaveLength(1)
      expect(screen.getAllByText('Destinatario')).toHaveLength(1)
    })

    it('When isPending is true and guide is null, Then it shows animated skeleton elements', () => {
      render(<GuideCard guide={null} isPending={true} />)

      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('Given the GuideCard component has guide data', () => {
    it('When guide is provided with all data, Then it displays all guide information', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      expect(screen.getByText('Entregado')).toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
      expect(screen.getByText(/Envío: SH-001/)).toBeInTheDocument()
    })

    it('When guide has origin information, Then it displays sender details', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      expect(screen.getByText('Remitente')).toBeInTheDocument()
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      const cities = screen.getAllByText('Ciudad de México')
      expect(cities.length).toBeGreaterThan(0)
    })

    it('When guide has destination information, Then it displays recipient details', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      expect(screen.getByText('Destinatario')).toBeInTheDocument()
      expect(screen.getByText('María García')).toBeInTheDocument()
      const cities = screen.getAllByText('Ciudad de México')
      expect(cities.length).toBeGreaterThanOrEqual(2)
    })

    it('When guide has courier logo, Then it displays the CourierImage component', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      expect(screen.getByTestId('guide-logo-image-box')).toBeInTheDocument()
    })

    it('When guide has label URL, Then it displays a link to view the label', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      const verEtiquetaText = screen.getByText('Ver etiqueta')
      const labelLink = verEtiquetaText.closest('a')
      
      expect(labelLink).toBeTruthy()
      expect(labelLink).toHaveAttribute('href', 'https://example.com/label.pdf')
      expect(labelLink).toHaveAttribute('target', '_blank')
      expect(labelLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('When guide has null courier, Then it still renders successfully', () => {
      render(<GuideCard guide={mockGuideWithNulls} isPending={false} />)

      expect(screen.getByText('1234567890')).toBeInTheDocument()
      expect(screen.getByTestId('guide-logo-image-box')).toBeInTheDocument()
    })

    it('When labelUrl is null, Then the link href is empty', () => {
      const guideWithoutLabelUrl: GuideUI = {
        ...mockGuideComplete,
        labelUrl: null
      }
      render(<GuideCard guide={guideWithoutLabelUrl} isPending={false} />)

      const verEtiquetaText = screen.getByText('Ver etiqueta')
      const labelLink = verEtiquetaText.closest('a')
      
      expect(labelLink).toBeTruthy()
      expect(labelLink).toHaveAttribute('href', '')
    })
  })

  describe('Given the GuideCard component transitions from loading to loaded', () => {
    it('When guide data becomes available, Then it switches from skeleton to full card', () => {
      const { rerender } = render(<GuideCard guide={null} isPending={true} />)

      expect(screen.getByTestId('guide-card-skeleton')).toBeInTheDocument()

      rerender(<GuideCard guide={mockGuideComplete} isPending={false} />)

      expect(screen.queryByTestId('guide-card-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
    })

    it('When isPending is false with guide data, Then it shows the full card even if isPending changes', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={true} />)

      expect(screen.queryByTestId('guide-card-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
    })
  })

  describe('Given varies origin and destination combinations', () => {
    it('When origin city differs from destination city, Then both cities are displayed', () => {
      const guideWithDifferentCities: GuideUI = {
        ...mockGuideComplete,
        origin: {
          ...mockGuideComplete.origin,
          city: 'Guadalajara'
        },
        destination: {
          ...mockGuideComplete.destination,
          city: 'Monterrey'
        }
      }
      render(<GuideCard guide={guideWithDifferentCities} isPending={false} />)

      expect(screen.getByText('Guadalajara')).toBeInTheDocument()
      expect(screen.getByText('Monterrey')).toBeInTheDocument()
    })

    it('When origin and destination have same city, Then city name appears twice', () => {
      render(<GuideCard guide={mockGuideComplete} isPending={false} />)

      const cities = screen.getAllByText('Ciudad de México')
      expect(cities).toHaveLength(2)
    })
  })
})
