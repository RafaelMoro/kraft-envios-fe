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
}));

import { getGuidesCb, getGuidesDbCb } from '@/shared/utils/guides.utils';

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;
const mockedGetGuidesCb = getGuidesCb as jest.MockedFunction<typeof getGuidesCb>;
const mockedGetGuidesDbCb = getGuidesDbCb as jest.MockedFunction<typeof getGuidesDbCb>;

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
      expect(screen.getByRole('button', { name: 'Ver todas las guias' })).toBeInTheDocument();
    });

    it('Then should disable Ver todas las guias button', async () => {
      mockedGetGuidesDbCb.mockResolvedValue(createMockDbResponse({ guides: [] }));

      renderWithQueryClient(<Order userInfo={mockUserInfo} />);

      expect(screen.getByRole('button', { name: 'Ver todas las guias' })).toBeDisabled();
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

      const selects = screen.getAllByRole('combobox');
      const monthSelect = selects[0];
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

      const selects = screen.getAllByRole('combobox');
      const yearSelect = selects[1];
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
        expect(screen.getByText('No hay guias para el mes seleccionado.')).toBeInTheDocument();
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
        expect(screen.getByText('KB-12345')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText('Fallido')).toBeInTheDocument();
      expect(screen.getByText(/GDE-PVR-005/)).toBeInTheDocument();
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
        expect(screen.getByText('KB-12345')).toBeInTheDocument();
      }, { timeout: 3000 });
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
  });
});
