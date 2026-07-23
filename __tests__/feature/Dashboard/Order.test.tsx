import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Order } from '@/features/Dashboard/subscreens/Order';
import { LoginData } from '@/shared/types/login.types';
import { GetGuidesData, GetGuidesDbResponseData, GuideDbRecord } from '@/shared/types/guides.types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

// Mock only browser APIs and network calls
jest.mock('../../../src/shared/hooks/useMediaQuery');
jest.mock('../../../src/shared/utils/guides.utils', () => ({
  ...jest.requireActual('../../../src/shared/utils/guides.utils'),
  getGuidesCb: jest.fn(),
  getGuidesDbCb: jest.fn(),
  deleteGuideDbCb: jest.fn(),
  hardDeleteGuideDbCb: jest.fn(),
}));

import { getGuidesCb, getGuidesDbCb, deleteGuideDbCb, hardDeleteGuideDbCb } from '@/shared/utils/guides.utils';

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;
const mockedGetGuidesCb = getGuidesCb as jest.MockedFunction<typeof getGuidesCb>;
const mockedGetGuidesDbCb = getGuidesDbCb as jest.MockedFunction<typeof getGuidesDbCb>;
const mockedDeleteGuideDbCb = deleteGuideDbCb as jest.MockedFunction<typeof deleteGuideDbCb>;
const mockedHardDeleteGuideDbCb = hardDeleteGuideDbCb as jest.MockedFunction<typeof hardDeleteGuideDbCb>;

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Order', () => {
  const mockUserInfo: LoginData = {
    data: {
      user: {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        lastName: 'Pérez',
        role: ['user']
      },
    },
    error: null,
    message: null,
    success: true,
    version: '1.0',
  };

  const mockGuides: GetGuidesData[] = [
    {
      trackingNumber: 'TRK123456',
      shipmentNumber: 'SHP789',
      carrier: 'Estafeta',
      source: 'GE',
      price: '150.50',
      guideLink: 'https://example.com/guide1',
      labelUrl: 'https://example.com/label1.pdf',
      file: null,
      status: 'En tránsito',
      origin: {
        name: 'Juan Pérez',
        alias: 'Casa Juan',
        street: 'Av. Principal',
        streetNumber: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        state: 'Ciudad de México',
      },
      destination: {
        name: 'María García',
        alias: 'Oficina María',
        street: 'Calle Secundaria',
        streetNumber: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        state: 'Ciudad de México',
      },
      courier: 'Estafeta',
    },
    {
      trackingNumber: 'TRK654321',
      shipmentNumber: 'SHP321',
      carrier: 'Fedex',
      source: 'Pkk',
      price: '200.00',
      guideLink: 'https://example.com/guide2',
      labelUrl: 'https://example.com/label2.pdf',
      file: null,
      status: 'Entregado',
      origin: {
        name: 'Carlos López',
        alias: 'Bodega Carlos',
        street: 'Av. Industrial',
        streetNumber: '789',
        neighborhood: 'Industrial',
        city: 'Monterrey',
        state: 'Nuevo León',
      },
      destination: {
        name: 'Ana Martínez',
        alias: 'Casa Ana',
        street: 'Calle Residencial',
        streetNumber: '321',
        neighborhood: 'Residencial',
        city: 'Guadalajara',
        state: 'Jalisco',
      },
      courier: 'Fedex',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When component renders with user info', () => {
    it('Then should display welcome message with user name', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      expect(screen.getByText('Bienvenido Juan Pérez')).toBeInTheDocument();
    });

    it('Then should display welcome message when user info is null', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={null} />);

      expect(screen.getByText(/Bienvenido/)).toBeInTheDocument();
    });
  });

  describe('When query returns an error', () => {
    it('Then should display error message', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockRejectedValue(new Error('Failed to fetch'));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });
      expect(screen.getByText('Ha sucedido un error. Intentelo nuevamente')).toBeInTheDocument();
    });

    it('Then should not display guides when error occurs', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockRejectedValue(new Error('Failed to fetch'));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
    });
  });

  describe('When rendering guides', () => {
    it('Then should render guides with correct data', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should display guides on desktop view', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      
      const estafetaElements = screen.getAllByText('Estafeta');
      expect(estafetaElements.length).toBeGreaterThan(0);
    });

    it('Then should display guides on mobile view', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should show loading state initially', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading
      );

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      expect(screen.getByText('Bienvenido Juan Pérez')).toBeInTheDocument();
    });
  });

  describe('When on desktop view', () => {
    it('Then should render guides for desktop', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });
  });

  describe('When on mobile or tablet view', () => {
    it('Then should render guides for mobile', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should render guides for tablet', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isTabletDesktop: true,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should display guide tracking numbers', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should display loaded data when not pending', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });
      expect(screen.getByText('En tránsito')).toBeInTheDocument();
    });
  });

  describe('When guides data is empty', () => {
    it('Then should not render guides when data is empty on desktop', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: [],
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('Bienvenido Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
    });

    it('Then should not render guides when data is empty on mobile', async () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedGetGuidesCb.mockResolvedValue({
        guides: [],
        messages: []
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('Bienvenido Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
    });
  });

  describe('When switching to DB source', () => {
    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should render source selector buttons', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse({ guides: [] }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      expect(screen.getByRole('button', { name: 'Ver guias externas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ver mis guias' })).toBeInTheDocument();
    });

    it('Then should not render Ver todas las guias button for non-admin user', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse({ guides: [] }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      expect(screen.queryByRole('button', { name: 'Ver todas las guias' })).not.toBeInTheDocument();
    });

    it('Then should call getGuidesDbCb with default params when switching to Ver mis guias', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            limit: 10,
          })
        );
      });
    });

    it('Then should reset page to 1 when changing month', async () => {
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 3 }))
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 3 }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });

      mockedGetGuidesDbCb.mockClear();

      const monthSelect = screen.getByLabelText('Mes:');
      await userEvent.selectOptions(monthSelect, '3');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, month: 3 })
        );
      });
    });

    it('Then should reset page to 1 when changing year', async () => {
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 3 }))
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 3 }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });

      mockedGetGuidesDbCb.mockClear();

      const yearSelect = screen.getByLabelText('Año:');
      await userEvent.selectOptions(yearSelect, String(new Date().getFullYear() - 1));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('Then should render empty message when DB guides are empty', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse({ guides: [] }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByText('No hay guias para los filtros seleccionados.')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Then should render failed DB record with kraftId and failure message', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              status: 'failed',
              failureInfo: {
                errorCode: 'GDE-PVR-005',
                errorDetails: 'Invalid address',
                timestamp: '2026-06-15T10:00:00Z',
              },
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByText('KB-12345')).toBeInTheDocument();
      expect(screen.getByText(/Fallido/)).toBeInTheDocument();
      expect(screen.getByText(/GDE-PVR-005/)).toBeInTheDocument();
      expect(screen.getByText(/El proveedor rechazó algunos datos de la guía/)).toBeInTheDocument();
    });

    it('Then should render failed DB record with null external fields', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              status: 'failed',
              trackingNumber: null,
              shipmentNumber: null,
              carrier: null,
              price: null,
              labelUrl: null,
              externalId: null,
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByText('KB-12345')).toBeInTheDocument();
      expect(screen.getByText('Mn')).toBeInTheDocument();
    });

    it('Then should render error state when DB query fails', async () => {
      mockedGetGuidesDbCb.mockRejectedValue(new Error('Server error'));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });
      expect(screen.getByText('Ha sucedido un error. Intentelo nuevamente')).toBeInTheDocument();
    });

    it('Then should not show external provider messages when on DB source', async () => {
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: ['T1 failed to get guides'],
      });
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.queryByText(/T1 failed to get guides/)).not.toBeInTheDocument();
      });
    });

    it('Then should not render external guides when on DB source', async () => {
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
      });
    });

    describe('When clicking Ver detalles on an own DB guide', () => {
      const buildMockResponse = (overrides: Partial<GuideDbRecord> = {}) =>
        createMockDbResponse({
          guides: [createMockDbRecord(overrides)],
        });

      it('Then should show details view and hide the list', async () => {
        mockedGetGuidesDbCb.mockResolvedValue(buildMockResponse());

        renderWithQueryClient(<Order userInfo={mockUserInfo} />);

        await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

        await waitFor(() => {
          expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId('guide-db-details-button'));

        expect(screen.getByTestId('guide-db-details-header')).toBeInTheDocument();
        expect(screen.getByText('KB-12345')).toBeInTheDocument();
        expect(screen.getByText(/Envío de/)).toBeInTheDocument();
        expect(screen.queryAllByTestId('guide-db-details-button')).toHaveLength(0);
      });

      it('Then should show package data from the selected guide', async () => {
        mockedGetGuidesDbCb.mockResolvedValue(buildMockResponse());

        renderWithQueryClient(<Order userInfo={mockUserInfo} />);

        await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
        await waitFor(() => {
          expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
        });
        await userEvent.click(screen.getByTestId('guide-db-details-button'));

        expect(screen.getAllByTestId('guide-db-details-summary-card')).toHaveLength(4);
        expect(screen.getAllByText('Electronica').length).toBeGreaterThan(0);
        expect(screen.getByText('SAT-001')).toBeInTheDocument();
      });

      it('Then should show the creation error block for failed guides', async () => {
        mockedGetGuidesDbCb.mockResolvedValue(
          buildMockResponse({
            status: 'failed',
            failureInfo: {
              errorCode: 'GDE-PVR-001',
              errorDetails: 'Insufficient funds',
              timestamp: '2026-07-05T08:14:00Z',
            },
          })
        );

        renderWithQueryClient(<Order userInfo={mockUserInfo} />);
        await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
        await waitFor(() => {
          expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
        });
        await userEvent.click(screen.getByTestId('guide-db-details-button'));

        expect(screen.getByTestId('guide-db-details-error')).toBeInTheDocument();
        expect(screen.getByText(/GDE-PVR-001/)).toBeInTheDocument();
        expect(screen.getByText(/No pudimos crear la guía con el proveedor/)).toBeInTheDocument();
        expect(screen.queryByText('Insufficient funds')).not.toBeInTheDocument();
      });

      it('Then should return to the list when clicking Volver a guías', async () => {
        mockedGetGuidesDbCb.mockResolvedValue(buildMockResponse());

        renderWithQueryClient(<Order userInfo={mockUserInfo} />);
        await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
        await waitFor(() => {
          expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
        });
        await userEvent.click(screen.getByTestId('guide-db-details-button'));

        expect(screen.getByTestId('guide-db-details-back-button')).toBeInTheDocument();

        await userEvent.click(screen.getByTestId('guide-db-details-back-button'));

        await waitFor(() => {
          expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
        });
        expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
      });

      it('Then should not call getGuidesDbCb again when opening details', async () => {
        mockedGetGuidesDbCb.mockResolvedValue(buildMockResponse());

        renderWithQueryClient(<Order userInfo={mockUserInfo} />);
        await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

        await waitFor(() => {
          expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
        });

        await userEvent.click(screen.getByTestId('guide-db-details-button'));

        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('When admin user views all guides', () => {
    const mockAdminUserInfo: LoginData = {
      data: {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          lastName: 'Admin',
          role: ['admin'],
        },
      },
      error: null,
      message: null,
      success: true,
      version: '1.0',
    };

    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should render Ver todas las guias button enabled for admin', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      const allButton = screen.getByRole('button', { name: 'Ver todas las guias' });
      expect(allButton).toBeInTheDocument();
      expect(allButton).toBeEnabled();
    });

    it('Then should call getGuidesDbCb with scope all and current month/year/page/limit when clicking Ver todas las guias', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({
            scope: 'all',
            page: 1,
            limit: 10,
          })
        );
      });
    });

    it('Then should call getGuidesDbCb with scope own after switching the scope select', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ scope: 'all' })
        );
      });

      mockedGetGuidesDbCb.mockClear();
      await userEvent.selectOptions(screen.getByLabelText('Alcance:'), 'own');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ scope: 'own' })
        );
      });
    });

    it('Then should never call getGuidesDbCb with a scope for non-admin user', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });

      const callsWithScope = mockedGetGuidesDbCb.mock.calls.filter(
        ([arg]) => arg && typeof arg === 'object' && 'scope' in arg && (arg as { scope?: unknown }).scope !== undefined,
      );
      expect(callsWithScope).toHaveLength(0);
    });

    it('Then should render admin list through GuideDbCard when admin clicks Ver todas las guias', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
    });

    it('Then should open and close admin guide details via GuideDbDetails', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByText('KB-12345')).toBeInTheDocument();
      expect(screen.getByTestId('guide-db-details-back-button')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('guide-db-details-back-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
    });

    it('Then should show soft-delete metadata on the card when deletedAt is non-null', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              deletedAt: '2026-06-15T10:00:00Z',
              deletedBy: 'admin@example.com',
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-card-deleted')).toBeInTheDocument();
      });
      expect(screen.getByText(/Eliminada el .*admin@example\.com/)).toBeInTheDocument();
    });

    it('Then should not show soft-delete metadata on the card when deletedAt is null', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({ deletedAt: null, deletedBy: null }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('guide-db-card-deleted')).not.toBeInTheDocument();
      expect(screen.queryByText(/Eliminada el/)).not.toBeInTheDocument();
    });

    it('Then should show the soft-delete block in details when deletedAt is non-null', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              status: 'created',
              failureInfo: null,
              deletedAt: '2026-06-15T10:00:00Z',
              deletedBy: 'admin@example.com',
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByTestId('guide-db-details-deleted')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-db-details-error')).not.toBeInTheDocument();
    });

    it('Then should call getGuidesDbCb with includeInternalPricing true after toggling Mostrar precio interno', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.not.objectContaining({ includeInternalPricing: true })
        );
      });

      mockedGetGuidesDbCb.mockClear();
      await userEvent.click(screen.getByTestId('order-admin-internal-pricing-toggle'));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ includeInternalPricing: true })
        );
      });
    });

    it('Then should call getGuidesDbCb with includeDeleted true after toggling Incluir guías eliminadas', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.not.objectContaining({ includeDeleted: true })
        );
      });

      mockedGetGuidesDbCb.mockClear();
      await userEvent.click(screen.getByTestId('order-admin-include-deleted-toggle'));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ includeDeleted: true })
        );
      });
    });

    it('Then should show the internal pricing block in details when q* fields are present', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              quote: {
                id: 'quote-internal',
                service: 'Estafeta',
                total: 230.7825,
                typeService: 'nextDay',
                courier: null,
                qBaseRef: 197.25,
                qAdjFactor: 33.5325,
                qAdjBasis: 17,
                qAdjMode: 'p',
                qAdjSrcRef: 'default',
              },
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByTestId('guide-db-details-internal-pricing')).toBeInTheDocument();
      expect(screen.getByText('PRECIO INTERNO')).toBeInTheDocument();
      expect(screen.getByText('Base')).toBeInTheDocument();
      expect(screen.getByText('$197.25')).toBeInTheDocument();
      expect(screen.getByText('Factor de ajuste')).toBeInTheDocument();
      expect(screen.getByText('Base de ajuste')).toBeInTheDocument();
      expect(screen.getByText('17%')).toBeInTheDocument();
      expect(screen.getByText('Modo de ajuste')).toBeInTheDocument();
      expect(screen.getByText('p')).toBeInTheDocument();
      expect(screen.getByText('Origen del ajuste')).toBeInTheDocument();
      expect(screen.getByText('Global')).toBeInTheDocument();
    });

    it('Then should not show the internal pricing block when no q* field is present', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.queryByTestId('guide-db-details-internal-pricing')).not.toBeInTheDocument();
    });

    it('Then should keep the internal pricing block independent of failure status', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              status: 'failed',
              failureInfo: {
                errorCode: 'GDE-PVR-005',
                errorDetails: 'Invalid address',
                timestamp: '2026-06-15T10:00:00Z',
              },
              quote: {
                id: 'quote-internal-failed',
                service: 'Estafeta',
                total: 230.7825,
                typeService: 'nextDay',
                courier: null,
                qBaseRef: 197.25,
                qAdjFactor: 33.5325,
                qAdjBasis: 17,
                qAdjMode: 'p',
                qAdjSrcRef: 'default',
              },
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByTestId('guide-db-details-internal-pricing')).toBeInTheDocument();
      expect(screen.getByTestId('guide-db-details-error')).toBeInTheDocument();
    });
  });

  describe('When soft-deleting a guide from Ver mis guias', () => {
    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should render the delete button on the card', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
    });

    it('Then should call deleteGuideDbCb with the correct kraftId and invalidate the list query on confirm from card', async () => {
      const initialRecord = createMockDbRecord();
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse({ guides: [initialRecord] }))
        .mockResolvedValueOnce(createMockDbResponse({ guides: [] }));
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.getByText('¿Deseas eliminar esta guia?')).toBeInTheDocument();
      expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-delete-button')).not.toBeInTheDocument();
      });
    });

    it('Then should return to the list after deleting from details', async () => {
      const initialRecord = createMockDbRecord();
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse({ guides: [initialRecord] }))
        .mockResolvedValueOnce(createMockDbResponse({ guides: [] }));
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByTestId('guide-db-details-header')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });

      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
      });
      expect(
        screen.getByText('No hay guias para los filtros seleccionados.'),
      ).toBeInTheDocument();
    });

    it('Then should show notification error when deleteGuideDbCb rejects', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedDeleteGuideDbCb.mockRejectedValue(new Error('Network down'));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(
          screen.getByText('No se pudo eliminar la guía. Por favor, intenta nuevamente.'),
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
    });

    it('Then should not call deleteGuideDbCb when the user cancels the modal', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-cancel'));

      expect(mockedDeleteGuideDbCb).not.toHaveBeenCalled();
      expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
    });
  });

  describe('When admin views Ver todas las guias', () => {
    const mockAdminUserInfo: LoginData = {
      data: {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          lastName: 'Admin',
          role: ['admin'],
        },
      },
      error: null,
      message: null,
      success: true,
      version: '1.0',
    };

    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should render the delete button on cards in the allDb source for admin', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
    });
  });

  describe('When admin hard-deletes a guide from Ver mis guias', () => {
    const mockAdminUserInfo: LoginData = {
      data: {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          lastName: 'Admin',
          role: ['admin'],
        },
      },
      error: null,
      message: null,
      success: true,
      version: '1.0',
    };

    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should render the hard-delete checkbox in the modal for admin', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.getByTestId('guide-db-hard-delete-checkbox')).toBeInTheDocument();
    });

    it('Then should call hardDeleteGuideDbCb when admin checks the box and confirms', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedHardDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
      expect(mockedDeleteGuideDbCb).not.toHaveBeenCalled();
    });

    it('Then should call deleteGuideDbCb when admin leaves the box unchecked', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
      expect(mockedHardDeleteGuideDbCb).not.toHaveBeenCalled();
    });

    it('Then should invalidate the guides db query on hard-delete success', async () => {
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse())
        .mockResolvedValueOnce(createMockDbResponse({ guides: [] }));
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });

      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(2);
      });
    });

    it('Then should return to the list after a hard-delete from details', async () => {
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse())
        .mockResolvedValueOnce(createMockDbResponse({ guides: [] }));
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      expect(screen.getByTestId('guide-db-details-header')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedHardDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
      });
    });

    it('Then should show the notification on hard-delete error', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedHardDeleteGuideDbCb.mockRejectedValue(new Error('Network down'));

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(
          screen.getByText('No se pudo eliminar la guía. Por favor, intenta nuevamente.'),
        ).toBeInTheDocument();
      });
    });

    it('Then should hard-delete a soft-deleted guide from Ver todas las guias', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              deletedAt: '2026-06-15T10:00:00Z',
              deletedBy: 'admin@example.com',
            }),
          ],
        })
      );
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedHardDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
    });

    it('Then should hard-delete a soft-deleted guide surfaced via the Incluir guías eliminadas toggle', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              deletedAt: '2026-06-15T10:00:00Z',
              deletedBy: 'admin@example.com',
            }),
          ],
        })
      );
      mockedHardDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await userEvent.click(screen.getByTestId('order-admin-include-deleted-toggle'));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ includeDeleted: true }),
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedHardDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
    });

    it('Then should open the hard-delete modal directly when admin clicks delete on a soft-deleted guide from Ver todas las guias', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(
        createMockDbResponse({
          guides: [
            createMockDbRecord({
              deletedAt: '2026-06-15T10:00:00Z',
              deletedBy: 'admin@example.com',
            }),
          ],
        })
      );

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));

      await userEvent.click(screen.getByTestId('order-admin-include-deleted-toggle'));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-details-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-details-button'));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.queryByTestId('guide-db-hard-delete-checkbox')).not.toBeInTheDocument();
      expect(screen.getByText('¿Eliminar permanentemente esta guía?')).toBeInTheDocument();
      expect(screen.getByTestId('guide-db-delete-confirm')).toHaveTextContent('Eliminar permanentemente');
    });
  });

  describe('When non-admin views Ver mis guias', () => {
    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa',
        name: 'Juan',
        lastName: 'Perez',
        phone: '5512345678',
        email: 'juan@example.com',
        company: '',
        street1: 'Av Principal',
        external_number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '06600',
        country: 'Mexico',
        reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina',
        name: 'Maria',
        lastName: 'Garcia',
        phone: '5587654321',
        email: 'maria@example.com',
        company: '',
        street1: 'Calle 2',
        external_number: '456',
        neighborhood: 'Polanco',
        city: 'CDMX',
        town: '',
        state: 'Ciudad de Mexico',
        zipcode: '11560',
        country: 'Mexico',
        reference: 'Torre corporate',
      },
      parcel: {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        content: 'Electronica',
        satProductId: 'SAT-001',
        value: 500,
        quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    it('Then should not render the hard-delete checkbox in the modal', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.queryByTestId('guide-db-hard-delete-checkbox')).not.toBeInTheDocument();
    });

    it('Then should never call hardDeleteGuideDbCb', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());
      mockedDeleteGuideDbCb.mockResolvedValue({
        version: '1.0',
        message: null,
        error: null,
        data: { guide: { kraftId: 'KB-12345' } },
      });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByTestId('guide-db-delete-button'));
      await userEvent.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(mockedDeleteGuideDbCb).toHaveBeenCalledWith('KB-12345');
      });
      expect(mockedHardDeleteGuideDbCb).not.toHaveBeenCalled();
    });
  });

  describe('When editing a failed DB guide', () => {
    it('opens and closes the edit modal from the card and details', async () => {
      const failedGuide: GuideDbRecord = {
        kraftId: 'KB-EDIT',
        quote: { id: 'quote-edit', service: 'Estafeta', total: 100, typeService: 'standard', courier: 'Estafeta' },
        externalId: null,
        trackingNumber: null,
        shipmentNumber: null,
        carrier: null,
        price: null,
        guideLink: null,
        labelUrl: null,
        file: null,
        status: 'failed',
        provider: 'Mn',
        isProviderTrackingSynced: false,
        failureInfo: null,
        origin: { alias: 'Origen', name: 'Juan', lastName: 'Perez', phone: '5512345678', email: 'juan@example.com', company: '', street1: 'Calle 1', external_number: '1', neighborhood: 'Centro', city: 'CDMX', town: '', state: 'CDMX', zipcode: '01000', country: 'Mexico', reference: '' },
        destination: { alias: 'Destino', name: 'Maria', lastName: 'Garcia', phone: '5587654321', email: 'maria@example.com', company: '', street1: 'Calle 2', external_number: '2', neighborhood: 'Centro', city: 'CDMX', town: '', state: 'CDMX', zipcode: '01000', country: 'Mexico', reference: '' },
        parcel: { length: 10, width: 10, height: 10, weight: 1, content: 'Caja', satProductId: 'SAT-001' },
        createdAt: '2026-07-13T10:00:00Z',
        updatedAt: '2026-07-13T10:00:00Z',
        deletedAt: null,
        deletedBy: null,
      }
      mockedUseMediaQuery.mockReturnValue({ isMobile: false, isTablet: false, isTabletDesktop: true, isMobileTablet: false, isDesktop: true, isDesktopX2: false });
      mockedGetGuidesCb.mockResolvedValue({ guides: mockGuides, messages: [] });
      mockedGetGuidesDbCb.mockResolvedValue({ guides: [failedGuide], total: 1, page: 1, limit: 10, totalPages: 1 });

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => expect(screen.getByTestId('guide-db-edit-button')).toBeInTheDocument());

      await userEvent.click(screen.getByTestId('guide-db-edit-button'));
      expect(screen.getAllByTestId('guide-db-edit-modal')).not.toHaveLength(0);
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryAllByTestId('guide-db-edit-modal')).toHaveLength(0));

      await userEvent.click(screen.getByTestId('guide-db-details-button'));
      await userEvent.click(screen.getByTestId('guide-db-edit-button'));
      expect(screen.getAllByTestId('guide-db-edit-modal')).not.toHaveLength(0);
    });
  });

  describe('When using the Guides DB date filter mode selector', () => {
    const createMockDbRecord = (overrides: Partial<GuideDbRecord> = {}): GuideDbRecord => ({
      kraftId: 'KB-12345',
      quote: {
        id: 'quote-123',
        service: 'Estafeta Terrestre',
        total: 178.56,
        typeService: 'standard',
        courier: 'Estafeta',
      },
      externalId: null,
      trackingNumber: null,
      shipmentNumber: null,
      carrier: null,
      price: null,
      guideLink: null,
      labelUrl: null,
      file: null,
      status: 'created',
      provider: 'Mn',
      isProviderTrackingSynced: false,
      failureInfo: null,
      origin: {
        alias: 'Casa', name: 'Juan', lastName: 'Perez', phone: '5512345678', email: 'juan@example.com',
        company: '', street1: 'Av Principal', external_number: '123', neighborhood: 'Centro', city: 'CDMX',
        town: '', state: 'Ciudad de Mexico', zipcode: '06600', country: 'Mexico', reference: 'Entre calle 1 y 2',
      },
      destination: {
        alias: 'Oficina', name: 'Maria', lastName: 'Garcia', phone: '5587654321', email: 'maria@example.com',
        company: '', street1: 'Calle 2', external_number: '456', neighborhood: 'Polanco', city: 'CDMX',
        town: '', state: 'Ciudad de Mexico', zipcode: '11560', country: 'Mexico', reference: 'Torre corporate',
      },
      parcel: {
        length: 10, width: 10, height: 10, weight: 1, content: 'Electronica', satProductId: 'SAT-001', value: 500, quantity: 1,
      },
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      deletedAt: null,
      deletedBy: null,
      ...overrides,
    });

    const createMockDbResponse = (overrides: Partial<GetGuidesDbResponseData> = {}): GetGuidesDbResponseData => ({
      guides: [createMockDbRecord()],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      ...overrides,
    });

    const mockAdminUserInfo: LoginData = {
      data: {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
          lastName: 'Admin',
          role: ['admin'],
        },
      },
      error: null,
      message: null,
      success: true,
      version: '1.0',
    };

    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });
      mockedGetGuidesCb.mockResolvedValue({
        guides: mockGuides,
        messages: [],
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('Then should default to the Mexico City business month/year regardless of host system time', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-08-01T04:00:00.000Z'));
      const user = userEvent.setup({ delay: null });
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await user.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({ month: 7, year: 2026 })
        );
      });
    });

    it('Then should render only month/year controls and send only month/year in month mode', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });

      expect(screen.getByLabelText('Mes:')).toBeInTheDocument();
      expect(screen.getByLabelText('Año:')).toBeInTheDocument();
      expect(screen.queryByLabelText('Fecha inicio:')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Fecha fin:')).not.toBeInTheDocument();

      const call = mockedGetGuidesDbCb.mock.calls[0][0];
      expect(call).not.toHaveProperty('startDate');
      expect(call).not.toHaveProperty('endDate');
    });

    it('Then should switch to range mode and show only the native date controls', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');

      expect(screen.queryByLabelText('Mes:')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Año:')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Fecha inicio:')).toBeInTheDocument();
      expect(screen.getByLabelText('Fecha fin:')).toBeInTheDocument();
    });

    it('Then should show a validation message and never call getGuidesDbCb when only one boundary is selected', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });
      mockedGetGuidesDbCb.mockClear();

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-01');

      await waitFor(() => {
        expect(screen.getByText('Ambas fechas son requeridas.')).toBeInTheDocument();
      });
      expect(mockedGetGuidesDbCb).not.toHaveBeenCalled();
    });

    it('Then should show a validation message and never call getGuidesDbCb when the end precedes the start', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });
      mockedGetGuidesDbCb.mockClear();

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-10');
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-01');

      await waitFor(() => {
        expect(screen.getByText('La fecha final no puede ser anterior a la inicial.')).toBeInTheDocument();
      });
      expect(mockedGetGuidesDbCb).not.toHaveBeenCalled();
    });

    it('Then should convert a valid range and call getGuidesDbCb with only startDate/endDate', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });
      mockedGetGuidesDbCb.mockClear();

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-01');
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-01');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: '2026-02-01T06:00:00.000Z',
            endDate: '2026-02-02T06:00:00.000Z',
          })
        );
      });

      const lastCall = mockedGetGuidesDbCb.mock.calls[mockedGetGuidesDbCb.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty('month');
      expect(lastCall).not.toHaveProperty('year');
    });

    it('Then should reset page to 1 when a range boundary changes after paging forward', async () => {
      mockedGetGuidesDbCb
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 2 }))
        .mockResolvedValueOnce(createMockDbResponse({ page: 2, totalPages: 2 }))
        .mockResolvedValueOnce(createMockDbResponse({ page: 1, totalPages: 2 }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-01');
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-05');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(2);
      });

      await userEvent.click(screen.getByRole('button', { name: '2' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(3);
      });
      expect(mockedGetGuidesDbCb).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));

      await userEvent.clear(screen.getByLabelText('Fecha fin:'));
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-06');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(4);
      });
      expect(mockedGetGuidesDbCb).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, endDate: '2026-02-07T06:00:00.000Z' })
      );
    });

    it('Then should close the open detail view when returning to the list and changing a range boundary', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver mis guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledTimes(1);
      });

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-01');
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-05');

      await waitFor(() => {
        expect(screen.getAllByTestId('guide-db-details-button')[0]).toBeInTheDocument();
      });
      await userEvent.click(screen.getAllByTestId('guide-db-details-button')[0]);
      expect(screen.getByTestId('guide-db-details-header')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('guide-db-details-back-button'));
      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
      });

      await userEvent.clear(screen.getByLabelText('Fecha fin:'));
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-06');

      await waitFor(() => {
        expect(screen.queryByTestId('guide-db-details-header')).not.toBeInTheDocument();
      });
      expect(screen.getByLabelText('Fecha fin:')).toBeInTheDocument();
    });

    it('Then should send the same converted range shape through the admin source with scope/admin flags retained', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockAdminUserInfo} />);

      await userEvent.click(screen.getByRole('button', { name: 'Ver todas las guias' }));
      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalled();
      });
      mockedGetGuidesDbCb.mockClear();

      await userEvent.selectOptions(screen.getByLabelText('Filtrar por:'), 'range');
      await userEvent.type(screen.getByLabelText('Fecha inicio:'), '2026-02-01');
      await userEvent.type(screen.getByLabelText('Fecha fin:'), '2026-02-01');

      await waitFor(() => {
        expect(mockedGetGuidesDbCb).toHaveBeenCalledWith(
          expect.objectContaining({
            scope: 'all',
            startDate: '2026-02-01T06:00:00.000Z',
            endDate: '2026-02-02T06:00:00.000Z',
          })
        );
      });

      const lastCall = mockedGetGuidesDbCb.mock.calls[mockedGetGuidesDbCb.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty('month');
      expect(lastCall).not.toHaveProperty('year');
    });

    it('Then should not affect the external guides source or its query', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse());

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      await waitFor(() => {
        expect(screen.getByText('TRK123456')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText('Filtrar por:')).not.toBeInTheDocument();
      expect(mockedGetGuidesDbCb).not.toHaveBeenCalled();
    });
  });
});
