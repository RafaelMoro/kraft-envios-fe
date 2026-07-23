import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { GuideCardPkk } from '@/features/Guides/ViewGuides/GuideCardPkk'
import { GetGuidesData, GuideUI } from '@/shared/types/guides.types'

jest.mock('../../../../src/shared/utils/guides.utils', () => ({
  ...jest.requireActual('../../../../src/shared/utils/guides.utils'),
  getPkkGuide: jest.fn()
}))

import { getPkkGuide } from '@/shared/utils/guides.utils'

const mockGetPkkGuide = getPkkGuide as jest.MockedFunction<typeof getPkkGuide>

const mockUpdatePkkGuide = jest.fn<void, [{ guideId: string; guideUpdated: GetGuidesData }]>()

const mockPkkGuide: GuideUI = {
  id: 'pkk-123',
  trackingNumber: 'PKK1234567890',
  shipmentNumber: 'SH-PKK-001',
  status: 'En tránsito',
  carrier: 'Paquetexpress',
  source: 'Pkk',
  price: '150.00',
  guideLink: null,
  labelUrl: null,
  file: null,
  courier: 'Paquetexpress',
  content: 'Documentos',
  startDate: '2024-01-15T16:30:00.000Z',
  hasBeenFetched: false,
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
    source: '/img/paquetexpress-logo.svg',
    provider: 'paquetexpress',
    width: 90,
    height: 30
  }
}

const mockPkkGuideWithoutOptionalFields: GuideUI = {
  ...mockPkkGuide,
  content: undefined,
  startDate: undefined
}

const mockFetchedGuideData: GetGuidesData = {
  trackingNumber: 'PKK1234567890',
  shipmentNumber: 'SH-PKK-001',
  status: 'En tránsito',
  carrier: 'Paquetexpress',
  source: 'Pkk',
  price: '150.00',
  guideLink: 'https://example.com/guide',
  labelUrl: 'https://example.com/label.pdf',
  file: null,
  courier: 'Paquetexpress',
  content: 'Documentos',
  startDate: '2024-01-15T16:30:00.000Z',
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
  }
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('GuideCardPkk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Given the GuideCardPkk component in mobile view', () => {
    it('When rendered with complete guide data, Then it displays all guide information', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByText('PKK1234567890')).toBeInTheDocument()
      expect(screen.getByText(/Envío: SH-PKK-001/)).toBeInTheDocument()
      expect(screen.getByText('Pkk')).toBeInTheDocument()
      expect(screen.getByText('En tránsito')).toBeInTheDocument()
    })

    it('When guide has content, Then it displays the content field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByText('Contenido')).toBeInTheDocument()
      expect(screen.getByText('documentos')).toBeInTheDocument()
    })

    it('When guide has startDate, Then it displays the formatted date', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByText('Fecha de inicio')).toBeInTheDocument()
      expect(screen.getByText(/Ene 15, 10:30 am/)).toBeInTheDocument()
    })

    it('When guide does not have content, Then it does not display the content field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuideWithoutOptionalFields} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
    })

    it('When guide does not have startDate, Then it does not display the date field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuideWithoutOptionalFields} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.queryByText('Fecha de inicio')).not.toBeInTheDocument()
    })

    it('When rendered, Then it displays the CourierImage component', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByTestId('guide-logo-image-box')).toBeInTheDocument()
    })

    it('When rendered, Then it displays the "Obtener información" button', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByRole('button', { name: /obtener información/i })).toBeInTheDocument()
    })
  })

  describe('Given the GuideCardPkk component in desktop view', () => {
    it('When rendered with complete guide data, Then it displays all guide information', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.getByText('PKK1234567890')).toBeInTheDocument()
      expect(screen.getByText(/Envío: SH-PKK-001/)).toBeInTheDocument()
      expect(screen.getByText('Pkk')).toBeInTheDocument()
      expect(screen.getByText('En tránsito')).toBeInTheDocument()
    })

    it('When guide has content, Then it displays the content field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.getByText('Contenido')).toBeInTheDocument()
      expect(screen.getByText('documentos')).toBeInTheDocument()
    })

    it('When guide has startDate, Then it displays the formatted date', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.getByText('Fecha de inicio')).toBeInTheDocument()
      expect(screen.getByText(/Ene 15, 10:30 am/)).toBeInTheDocument()
    })

    it('When guide does not have content, Then it does not display the content field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuideWithoutOptionalFields} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
    })

    it('When guide does not have startDate, Then it does not display the date field', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuideWithoutOptionalFields} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.queryByText('Fecha de inicio')).not.toBeInTheDocument()
    })

    it('When rendered, Then it displays the "Obtener información" button', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={true} />
      )

      expect(screen.getByRole('button', { name: /obtener información/i })).toBeInTheDocument()
    })
  })

  describe('Given the user clicks the "Obtener información" button', () => {
    it('When clicked, Then it displays a loading spinner', async () => {
      const user = userEvent.setup()
      mockGetPkkGuide.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      const button = screen.getByRole('button', { name: /obtener información/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByLabelText(`loading guide ${mockPkkGuide.trackingNumber}`)).toBeInTheDocument()
      })
    })

    it('When data is fetched successfully, Then it calls updatePkkGuide with the fetched data', async () => {
      const user = userEvent.setup()
      mockGetPkkGuide.mockResolvedValue({
        guide: mockFetchedGuideData
      })

      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      const button = screen.getByRole('button', { name: /obtener información/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockUpdatePkkGuide).toHaveBeenCalledWith({
          guideId: mockPkkGuide.id,
          guideUpdated: mockFetchedGuideData
        })
      })
    })

    it('When data is fetched successfully, Then updatePkkGuide is called only once', async () => {
      const user = userEvent.setup()
      mockGetPkkGuide.mockResolvedValue({
        guide: mockFetchedGuideData
      })

      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      const button = screen.getByRole('button', { name: /obtener información/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockUpdatePkkGuide).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Given the GuideCardPkk component with null courier', () => {
    it('When courier is null, Then it still renders successfully', () => {
      const guideWithNullCourier = {
        ...mockPkkGuide,
        courier: null
      }

      renderWithQueryClient(
        <GuideCardPkk guide={guideWithNullCourier} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByText('PKK1234567890')).toBeInTheDocument()
      expect(screen.getByTestId('guide-logo-image-box')).toBeInTheDocument()
    })
  })

  describe('Given different guide status values', () => {
    it('When status is provided, Then it displays the formatted status label', () => {
      renderWithQueryClient(
        <GuideCardPkk guide={mockPkkGuide} updatePkkGuide={mockUpdatePkkGuide} isDesktop={false} />
      )

      expect(screen.getByText('En tránsito')).toBeInTheDocument()
    })
  })
})
