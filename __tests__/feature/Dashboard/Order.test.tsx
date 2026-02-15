import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import { Order } from '@/features/Dashboard/subscreens/Order';
import { LoginData } from '@/shared/types/login.types';
import { GetGuidesData } from '@/shared/types/guides.types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { UserRoles } from '@/shared/types/global.types';

// Mock dependencies
jest.mock('../../../src/shared/hooks/useMediaQuery');
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));
jest.mock('../../../src/shared/utils/quotes.utils', () => ({
  getQuoteImg: jest.fn((params) => ({
    source: '/img/mock-logo.svg',
    provider: 'mock',
    width: params?.isMobile ? 64 : 90,
    height: params?.isMobile ? 18 : 30,
  })),
}));

// Mock child components to avoid testing their internals
jest.mock('../../../src/features/Guides/ViewGuides/GuidesTable', () => ({
  GuidesTable: ({ guides, isPending }: { guides: GetGuidesData[]; isPending: boolean }) => (
    <div data-testid="guides-table">
      <div data-testid="guides-table-pending">{String(isPending)}</div>
      <div data-testid="guides-table-count">{guides.length}</div>
    </div>
  ),
}));

jest.mock('../../../src/features/Guides/ViewGuides/GuideCard', () => ({
  GuideCard: ({ guide, isPending }: { guide: GetGuidesData | null; isPending: boolean }) => (
    <div data-testid="guide-card">
      <div data-testid="guide-card-pending">{String(isPending)}</div>
      {guide && <div data-testid="guide-card-tracking">{guide.trackingNumber}</div>}
    </div>
  ),
}));

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

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

  const createMockQueryResult = (overrides = {}): ReturnType<typeof useQuery> => ({
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle',
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: false,
    refetch: jest.fn(),
    status: 'pending',
    promise: Promise.resolve(undefined),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When component renders with user info', () => {
    it('Then should display welcome message with user name', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByText('Bienvenido Juan Pérez')).toBeInTheDocument();
    });

    it('Then should display welcome message when user info is null', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={null} />);

      expect(screen.getByText(/Bienvenido/)).toBeInTheDocument();
    });
  });

  describe('When query returns an error', () => {
    it('Then should display error message', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          isError: true,
          error: new Error('Failed to fetch'),
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByText('Oops!')).toBeInTheDocument();
      expect(screen.getByText('Ha sucedido un error. Intentelo nuevamente')).toBeInTheDocument();
    });

    it('Then should not display guides table or cards when error occurs', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          isError: true,
          error: new Error('Failed to fetch'),
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.queryByTestId('guides-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('guide-card')).not.toBeInTheDocument();
    });
  });

  describe('When on desktop view', () => {
    it('Then should render GuidesTable component', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByTestId('guides-table')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-card')).not.toBeInTheDocument();
    });

    it('Then should pass correct data to GuidesTable', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByTestId('guides-table-pending')).toHaveTextContent('false');
      expect(screen.getByTestId('guides-table-count')).toHaveTextContent('2');
    });

    it('Then should pass isPending true to GuidesTable when loading', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isPending: true,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByTestId('guides-table-pending')).toHaveTextContent('true');
    });
  });

  describe('When on mobile or tablet view', () => {
    it('Then should render GuideCard components for mobile', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      const guideCards = screen.getAllByTestId('guide-card');
      expect(guideCards).toHaveLength(2);
      expect(screen.queryByTestId('guides-table')).not.toBeInTheDocument();
    });

    it('Then should render GuideCard components for tablet', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isTabletDesktop: true,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      const guideCards = screen.getAllByTestId('guide-card');
      expect(guideCards).toHaveLength(2);
      expect(screen.queryByTestId('guides-table')).not.toBeInTheDocument();
    });

    it('Then should display guide tracking numbers in cards', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByText('TRK123456')).toBeInTheDocument();
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should render 2 skeleton GuideCards when loading', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isPending: true,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      const guideCards = screen.getAllByTestId('guide-card');
      expect(guideCards).toHaveLength(2);
      
      const pendingStates = screen.getAllByTestId('guide-card-pending');
      pendingStates.forEach((state) => {
        expect(state).toHaveTextContent('true');
      });
    });

    it('Then should not render skeleton cards when data is loaded', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: mockGuides,
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      const pendingStates = screen.getAllByTestId('guide-card-pending');
      pendingStates.forEach((state) => {
        expect(state).toHaveTextContent('false');
      });
    });
  });

  describe('When guides data is empty', () => {
    it('Then should render GuidesTable with empty array on desktop', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: true,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: [],
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.getByTestId('guides-table')).toBeInTheDocument();
      expect(screen.getByTestId('guides-table-count')).toHaveTextContent('0');
    });

    it('Then should not render GuideCards on mobile when no data', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false,
      });

      mockedUseQuery.mockReturnValue(
        createMockQueryResult({
          data: [],
          isSuccess: true,
          isPending: false,
        })
      );

      render(<Order userInfo={mockUserInfo} />);

      expect(screen.queryByTestId('guide-card')).not.toBeInTheDocument();
    });
  });
});
