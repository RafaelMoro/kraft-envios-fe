import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResultGuideScreen } from '@/features/Guides/ResultGuideScreen';
import { GlobalCreateGuideResponse } from '@/shared/types/guides.types';

// Mock the utils
jest.mock('../../../src/shared/utils/global.utils', () => ({
  formatNumberToCurrency: jest.fn((value) => `$${value.toFixed(2)} MXN`)
}));

jest.mock('../../../src/shared/utils/guides.utils', () => ({
  b64toBlob: jest.fn(() => new Blob(['test'], { type: 'application/pdf' }))
}));

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('ResultGuideScreen', () => {
  const mockCloseModal = jest.fn();
  
  const mockGuideGE: GlobalCreateGuideResponse = {
    trackingNumber: 'GE123456789',
    carrier: 'Estafeta',
    source: 'GE',
    price: '150.50',
    guideLink: 'https://example.com/guide',
    labelUrl: 'https://example.com/label.pdf',
    file: null
  };

  const mockGuidePkk: GlobalCreateGuideResponse = {
    trackingNumber: 'PKK987654321',
    carrier: 'Paquetexpress',
    source: 'Pkk',
    price: '200.00',
    guideLink: 'https://example.com/guide',
    labelUrl: null,
    file: 'JVBERi0xLjQKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3==', // base64 mock
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Given a successful guide creation', () => {
    describe('When the guide is from GE source', () => {
      it('Then should display guide information with tracking number, carrier, price and label link', () => {
        render(
          <ResultGuideScreen
            guide={mockGuideGE}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument();
        expect(screen.getByText(/Número de guía: GE123456789/)).toBeInTheDocument();
        expect(screen.getByText('Estafeta')).toBeInTheDocument();
        expect(screen.getByText('$150.50 MXN')).toBeInTheDocument();
        
        const labelLink = screen.getByRole('link', { name: /ver etiqueta/i });
        expect(labelLink).toHaveAttribute('href', 'https://example.com/label.pdf');
        expect(labelLink).toHaveAttribute('target', '_blank');
        expect(labelLink).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('Then should display finish button', () => {
        render(
          <ResultGuideScreen
            guide={mockGuideGE}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument();
      });

      it('Then should call closeModal when finish button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
          <ResultGuideScreen
            guide={mockGuideGE}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        const finishButton = screen.getByRole('button', { name: /finalizar/i });
        await user.click(finishButton);

        expect(mockCloseModal).toHaveBeenCalledTimes(1);
      });
    });

    describe('When the guide is from Pkk source', () => {
      it('Then should convert base64 file to blob and create object URL for label', async () => {
        const { b64toBlob } = await import('../../../src/shared/utils/guides.utils');
        
        render(
          <ResultGuideScreen
            guide={mockGuidePkk}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        expect(b64toBlob).toHaveBeenCalledWith(mockGuidePkk.file, 'application/pdf');
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        
        const labelLink = screen.getByRole('link', { name: /ver etiqueta/i });
        expect(labelLink).toHaveAttribute('href', 'blob:mock-url');
      });

      it('Then should display guide information with Pkk carrier', () => {
        render(
          <ResultGuideScreen
            guide={mockGuidePkk}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument();
        expect(screen.getByText(/Número de guía: PKK987654321/)).toBeInTheDocument();
        expect(screen.getByText('Paquetexpress')).toBeInTheDocument();
        expect(screen.getByText('$200.00 MXN')).toBeInTheDocument();
      });
    });

    describe('When guide price is undefined', () => {
      it('Then should display formatted price as $0.00 MXN', () => {
        const guideWithoutPrice = { ...mockGuideGE, price: undefined as unknown as string };
        
        render(
          <ResultGuideScreen
            guide={guideWithoutPrice}
            isSuccess={true}
            isError={false}
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByText('$0.00 MXN')).toBeInTheDocument();
      });
    });
  });

  describe('Given a failed guide creation', () => {
    describe('When there is a generic error', () => {
      it('Then should display generic error message', () => {
        render(
          <ResultGuideScreen
            guide={undefined}
            isSuccess={false}
            isError={true}
            errorMessage="Connection timeout"
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByText('Error al crear la guía')).toBeInTheDocument();
        expect(screen.getByText('Ocurrió un error al crear la guía. Por favor, intente nuevamente.')).toBeInTheDocument();
      });

      it('Then should not display guide information', () => {
        render(
          <ResultGuideScreen
            guide={undefined}
            isSuccess={false}
            isError={true}
            closeModal={mockCloseModal}
          />
        );

        expect(screen.queryByText(/Número de guía:/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /ver etiqueta/i })).not.toBeInTheDocument();
      });
    });

    describe('When the error is insufficient balance', () => {
      it('Then should display specific insufficient balance error message', () => {
        render(
          <ResultGuideScreen
            guide={undefined}
            isSuccess={false}
            isError={true}
            errorMessage="No cuenta con saldo suficiente"
            closeModal={mockCloseModal}
          />
        );

        expect(screen.getByText('Error al crear la guía')).toBeInTheDocument();
        expect(screen.getByText('Saldo insuficiente en TONE. Por favor, recarga tu cuenta e intenta nuevamente.')).toBeInTheDocument();
      });
    });

    describe('When finish button is clicked on error', () => {
      it('Then should call closeModal', async () => {
        const user = userEvent.setup();
        
        render(
          <ResultGuideScreen
            guide={undefined}
            isSuccess={false}
            isError={true}
            closeModal={mockCloseModal}
          />
        );

        const finishButton = screen.getByRole('button', { name: /finalizar/i });
        await user.click(finishButton);

        expect(mockCloseModal).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Given neither success nor error state', () => {
    it('Then should only display title without content', () => {
      render(
        <ResultGuideScreen
          guide={undefined}
          isSuccess={false}
          isError={false}
          closeModal={mockCloseModal}
        />
      );

      expect(screen.getByText('Error al crear la guía')).toBeInTheDocument();
      expect(screen.queryByText(/Número de guía:/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument();
    });
  });
});
