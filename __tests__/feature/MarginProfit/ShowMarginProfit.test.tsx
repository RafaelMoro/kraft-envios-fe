import { render, screen } from "@testing-library/react"

import { ShowProfitMargin } from "@/features/ProfitMargin/ShowProfitMargin"
import { ProfitMargin } from "@/shared/types/margin-profit.types"

describe('ShowProfitMargin', () => {
  describe('Given no profit margin data is provided', () => {
    it('When data is null, Then it displays "not established" message', () => {
      render(<ShowProfitMargin data={null} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      expect(screen.getByText(/no se ha establecido un margen de ganancia aún\./i)).toBeInTheDocument()
    })

    it('When data is undefined, Then it displays "not established" message', () => {
      render(<ShowProfitMargin data={undefined} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      expect(screen.getByText(/no se ha establecido un margen de ganancia aún\./i)).toBeInTheDocument()
    })

    it('When data has zero value, Then it displays "not established" message', () => {
      const data: ProfitMargin = {
        value: 0,
        type: 'percentage'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      expect(screen.getByText(/no se ha establecido un margen de ganancia aún\./i)).toBeInTheDocument()
    })
  })

  describe('Given profit margin data with percentage type is provided', () => {
    it('When data has percentage type with value 15, Then it displays percentage format with chart icon', () => {
      const data: ProfitMargin = {
        value: 15,
        type: 'percentage'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+15%/)).toBeInTheDocument()
      
      // Check for the chart icon (RiLineChartLine)
      const svgElement = screen.getByRole('heading', { name: /margen de ganancia actual/i })
        .closest('div')
        ?.querySelector('svg')
      expect(svgElement).toBeInTheDocument()
    })

    it('When data has percentage type with decimal value 12.5, Then it displays correct percentage format', () => {
      const data: ProfitMargin = {
        value: 12.5,
        type: 'percentage'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument()
    })

    it('When data has percentage type with large value 100, Then it displays correct percentage format', () => {
      const data: ProfitMargin = {
        value: 100,
        type: 'percentage'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+100%/)).toBeInTheDocument()
    })
  })

  describe('Given profit margin data with absolute type is provided', () => {
    it('When data has absolute type with value 50, Then it displays dollar format without chart icon', () => {
      const data: ProfitMargin = {
        value: 50,
        type: 'absolute'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+\$50/)).toBeInTheDocument()
      
      // Check that chart icon is NOT present for absolute type
      const svgElement = screen.getByRole('heading', { name: /margen de ganancia actual/i })
        .closest('div')
        ?.querySelector('svg')
      expect(svgElement).not.toBeInTheDocument()
    })

    it('When data has absolute type with decimal value 25.75, Then it displays correct dollar format', () => {
      const data: ProfitMargin = {
        value: 25.75,
        type: 'absolute'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+\$25\.75/)).toBeInTheDocument()
    })

    it('When data has absolute type with large value 1000, Then it displays correct dollar format', () => {
      const data: ProfitMargin = {
        value: 1000,
        type: 'absolute'
      }

      render(<ShowProfitMargin data={data} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia actual/i })).toBeInTheDocument()
      expect(screen.getByText(/\+\$1000/)).toBeInTheDocument()
    })
  })

  describe('Given the component structure and styling', () => {
    it('When profit margin data is provided, Then it renders within a Card component', () => {
      const data: ProfitMargin = {
        value: 15,
        type: 'percentage'
      }

      const { container } = render(<ShowProfitMargin data={data} />)

      // Check for Card component structure
      const cardElement = container.querySelector('.max-w-sm.mx-auto')
      expect(cardElement).toBeInTheDocument()
    })

    it('When profit margin data is provided, Then the value has green styling classes', () => {
      const data: ProfitMargin = {
        value: 15,
        type: 'percentage'
      }

      const { container } = render(<ShowProfitMargin data={data} />)

      // Check for green text styling
      const greenElement = container.querySelector('.text-green-700.dark\\:text-green-400')
      expect(greenElement).toBeInTheDocument()
    })

    it('When no profit margin data is provided, Then it renders as a section without Card', () => {
      const { container } = render(<ShowProfitMargin data={null} />)

      // Check for section structure
      const sectionElement = container.querySelector('section.flex.flex-col.gap-4')
      expect(sectionElement).toBeInTheDocument()
      
      // Check that Card is NOT present
      const cardElement = container.querySelector('.max-w-sm.mx-auto')
      expect(cardElement).not.toBeInTheDocument()
    })
  })
})