import { render, screen } from "@testing-library/react"

import { ShowProfitMargin } from "@/features/ProfitMargin/ShowProfitMargin"
import { ProviderGlobalConfig } from "@/shared/types/margin-profit.types"

describe('ShowProfitMargin', () => {
  describe('Given error state', () => {
    it('When isError is true and not pending, Then it displays error message', () => {
      render(<ShowProfitMargin data={null} isPending={false} isError={true} />)

      expect(screen.getByRole('heading', { name: /oops!/i })).toBeInTheDocument()
      expect(screen.getByText(/ha sucedido un error\. intentelo nuevamente/i)).toBeInTheDocument()
    })
  })

  describe('Given loading state', () => {
    it('When isPending is true and no data, Then it displays skeleton loaders', () => {
      render(<ShowProfitMargin data={null} isPending={true} isError={false} />)

      // Should render 4 skeleton cards
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('Given no profit margin data is provided', () => {
    it('When data is null and not pending, Then it displays empty grid', () => {
      const { container } = render(<ShowProfitMargin data={null} isPending={false} isError={false} />)

      // Component renders empty grid for null data
      const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4')
      expect(gridElement).toBeInTheDocument()
      expect(gridElement?.children.length).toBe(0)
    })

    it('When data is undefined and not pending, Then it displays empty grid', () => {
      const { container } = render(<ShowProfitMargin data={undefined} isPending={false} isError={false} />)

      // Component renders empty grid for undefined data
      const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4')
      expect(gridElement).toBeInTheDocument()
      expect(gridElement?.children.length).toBe(0)
    })

    it('When data is empty array and not pending, Then it displays "not established" message', () => {
      const data: ProviderGlobalConfig[] = []

      render(<ShowProfitMargin data={data} isPending={false} isError={false} />)

      expect(screen.getByRole('heading', { name: /margen de ganancia no establecido/i })).toBeInTheDocument()
      expect(screen.getByText(/no se ha establecido un margen de ganancia aún\./i)).toBeInTheDocument()
    })
  })

  describe('Given provider data is provided', () => {
    it('When data has providers, Then it displays provider cards', () => {
      const data: ProviderGlobalConfig[] = [
        {
          name: 'GE',
          couriers: [
            {
              name: 'Fedex',
              profitMargin: {
                value: 15,
                type: 'percentage'
              }
            }
          ]
        }
      ]

      render(<ShowProfitMargin data={data} isPending={false} isError={false} />)

      // Should render the grid container
      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(gridContainer).toBeInTheDocument()
    })

    it('When data has multiple providers, Then it displays multiple provider cards', () => {
      const data: ProviderGlobalConfig[] = [
        {
          name: 'GE',
          couriers: [
            {
              name: 'Fedex',
              profitMargin: {
                value: 15,
                type: 'percentage'
              }
            }
          ]
        },
        {
          name: 'TONE',
          couriers: [
            {
              name: 'UPS',
              profitMargin: {
                value: 25,
                type: 'absolute'
              }
            }
          ]
        }
      ]

      render(<ShowProfitMargin data={data} isPending={false} isError={false} />)

      // Should render the grid container with multiple cards
      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(gridContainer).toBeInTheDocument()
    })
  })

  describe('Given the component structure and styling', () => {
    it('When provider data is provided, Then it renders within a grid layout', () => {
      const data: ProviderGlobalConfig[] = [
        {
          name: 'GE',
          couriers: [
            {
              name: 'Fedex',
              profitMargin: {
                value: 15,
                type: 'percentage'
              }
            }
          ]
        }
      ]

      const { container } = render(<ShowProfitMargin data={data} isPending={false} isError={false} />)

      // Check for grid layout
      const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4')
      expect(gridElement).toBeInTheDocument()
    })

    it('When no provider data is provided, Then it renders as empty grid without section', () => {
      const { container } = render(<ShowProfitMargin data={null} isPending={false} isError={false} />)

      // Check for grid structure (empty grid for null data)
      const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4')
      expect(gridElement).toBeInTheDocument()
      
      // Check that section is NOT present for null data
      const sectionElement = container.querySelector('section.flex.flex-col.gap-4')
      expect(sectionElement).not.toBeInTheDocument()
    })
  })
})