import { render, screen } from '@testing-library/react';

import { GuidesTable } from '@/features/Guides/ViewGuides/GuidesTable';
import { GetGuidesData } from '@/shared/types/guides.types';

describe('GuidesTable', () => {
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

  describe('When loading (isPending: true)', () => {
    it('Then should display skeleton rows', () => {
      render(<GuidesTable guides={[]} isPending={true} />);

      const skeletonRows = screen.getAllByTestId('guide-table-skeleton-row');
      expect(skeletonRows).toHaveLength(5);
    });

    it('Then should not display any guide data', () => {
      render(<GuidesTable guides={mockGuides} isPending={true} />);

      expect(screen.queryByText('Casa Juan')).not.toBeInTheDocument();
      expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
    });
  });

  describe('When guides are loaded (isPending: false)', () => {
    it('Then should display all table headers', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('Remitente')).toBeInTheDocument();
      expect(screen.getByText('Destinatario')).toBeInTheDocument();
      expect(screen.getByText('Proveedor')).toBeInTheDocument();
      expect(screen.getByText('Origen')).toBeInTheDocument();
      expect(screen.getByText('Número de guia')).toBeInTheDocument();
      expect(screen.getByText('Número de envio')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Etiqueta')).toBeInTheDocument();
    });

    it('Then should display all guides', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('juan pérez')).toBeInTheDocument();
      expect(screen.getByText('maría garcía')).toBeInTheDocument();
      expect(screen.getByText('carlos lópez')).toBeInTheDocument();
      expect(screen.getByText('ana martínez')).toBeInTheDocument();
    });

    it('Then should display origin information for each guide', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('juan pérez')).toBeInTheDocument();
      expect(screen.getByText(/Av\. Principal 123, Centro, CDMX, Ciudad de México/)).toBeInTheDocument();
      
      expect(screen.getByText('carlos lópez')).toBeInTheDocument();
      expect(screen.getByText(/Av\. Industrial 789, Industrial, Monterrey, Nuevo León/)).toBeInTheDocument();
    });

    it('Then should display destination information for each guide', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('maría garcía')).toBeInTheDocument();
      expect(screen.getByText(/Calle Secundaria 456, Polanco, CDMX, Ciudad de México/)).toBeInTheDocument();
      
      expect(screen.getByText('ana martínez')).toBeInTheDocument();
      expect(screen.getByText(/Calle Residencial 321, Residencial, Guadalajara, Jalisco/)).toBeInTheDocument();
    });

    it('Then should display carrier information', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('Estafeta')).toBeInTheDocument();
      expect(screen.getByText('Fedex')).toBeInTheDocument();
    });

    it('Then should display source information', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('GE')).toBeInTheDocument();
      expect(screen.getByText('Pkk')).toBeInTheDocument();
    });

    it('Then should display tracking numbers', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('TRK123456')).toBeInTheDocument();
      expect(screen.getByText('TRK654321')).toBeInTheDocument();
    });

    it('Then should display shipment numbers', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('SHP789')).toBeInTheDocument();
      expect(screen.getByText('SHP321')).toBeInTheDocument();
    });

    it('Then should display status information', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      expect(screen.getByText('En tránsito')).toBeInTheDocument();
      expect(screen.getByText('Entregado')).toBeInTheDocument();
    });

    it('Then should display label links with correct attributes', () => {
      render(<GuidesTable guides={mockGuides} isPending={false} />);

      const labelLinks = screen.getAllByRole('link');
      expect(labelLinks).toHaveLength(2);
      
      expect(labelLinks[0]).toHaveAttribute('href', 'https://example.com/label1.pdf');
      expect(labelLinks[0]).toHaveAttribute('target', '_blank');
      expect(labelLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
      
      expect(labelLinks[1]).toHaveAttribute('href', 'https://example.com/label2.pdf');
      expect(labelLinks[1]).toHaveAttribute('target', '_blank');
      expect(labelLinks[1]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Then should handle guide with null labelUrl', () => {
      const guidesWithNullLabel: GetGuidesData[] = [
        {
          ...mockGuides[0],
          labelUrl: null,
        },
      ];

      render(<GuidesTable guides={guidesWithNullLabel} isPending={false} />);

      // Verify the guide data is still displayed correctly
      expect(screen.getByText('juan pérez')).toBeInTheDocument();
      expect(screen.getByText('TRK123456')).toBeInTheDocument();
      expect(screen.getByText('Estafeta')).toBeInTheDocument();
      expect(screen.getByText('En tránsito')).toBeInTheDocument();
    });
  });

  describe('When no guides are available', () => {
    it('Then should display empty table with headers', () => {
      render(<GuidesTable guides={[]} isPending={false} />);

      expect(screen.getByText('Remitente')).toBeInTheDocument();
      expect(screen.getByText('Destinatario')).toBeInTheDocument();
      expect(screen.getByText('Proveedor')).toBeInTheDocument();
      
      expect(screen.queryByText('juan pérez')).not.toBeInTheDocument();
      expect(screen.queryByText('TRK123456')).not.toBeInTheDocument();
    });
  });

  describe('When origin is null', () => {
    it('Then should display unavailable sender info message', () => {
      const guidesWithoutOrigin: GetGuidesData[] = [
        {
          ...mockGuides[0],
          origin: null,
        },
      ];

      render(<GuidesTable guides={guidesWithoutOrigin} isPending={false} />);

      expect(screen.getByText('Datos del remitente no disponible')).toBeInTheDocument();
      expect(screen.getByText('maría garcía')).toBeInTheDocument();
    });
  });

  describe('When destination has only street', () => {
    it('Then should display only street information', () => {
      const guidesWithOnlyStreet: GetGuidesData[] = [
        {
          ...mockGuides[0],
          destination: {
            name: 'Pedro García',
            alias: 'Casa Pedro',
            street: 'Calle Principal',
            streetNumber: '',
            neighborhood: '',
            city: '',
            state: '',
          },
        },
      ];

      render(<GuidesTable guides={guidesWithOnlyStreet} isPending={false} />);

      expect(screen.getByText('pedro garcía')).toBeInTheDocument();
      
      const streetElement = screen.getByText('Calle Principal');
      expect(streetElement).toBeInTheDocument();
      expect(streetElement.textContent).toBe('Calle Principal');
    });
  });
});
