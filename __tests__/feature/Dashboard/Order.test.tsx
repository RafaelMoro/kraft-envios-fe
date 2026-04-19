import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Order } from '@/features/Dashboard/subscreens/Order';
import { LoginData } from '@/shared/types/login.types';
import { GetGuidesData } from '@/shared/types/guides.types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

// Mock only browser APIs and network calls
jest.mock('../../../src/shared/hooks/useMediaQuery');
jest.mock('../../../src/shared/utils/guides.utils', () => ({
  ...jest.requireActual('../../../src/shared/utils/guides.utils'),
  getGuidesCb: jest.fn(),
}));

import { getGuidesCb } from '@/shared/utils/guides.utils';

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;
const mockedGetGuidesCb = getGuidesCb as jest.MockedFunction<typeof getGuidesCb>;

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
});
