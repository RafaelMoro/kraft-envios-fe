import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GuideDbCard } from '@/features/Dashboard/subscreens/GuideDbCard';
import { GuideDbRecord } from '@/shared/types/guides.types';

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

describe('Feature: GuideDbCard delete control', () => {
  const baseProps = {
    isMobile: false,
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario: Delete control visibility', () => {
    it('Given a non-deleted guide with onDeleteGuide, When the card renders, Then the delete button is visible', () => {
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
    });

    it('Given a deleted guide (deletedAt set), When the card renders, Then the delete button is hidden', () => {
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord({ deletedAt: '2026-06-15T10:00:00Z', deletedBy: 'admin@example.com' })}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      expect(screen.queryByTestId('guide-db-delete-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('guide-db-card-deleted')).toBeInTheDocument();
    });

    it('Given a non-deleted guide without onDeleteGuide, When the card renders, Then the delete button is hidden', () => {
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord()}
        />,
      );

      expect(screen.queryByTestId('guide-db-delete-button')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: Confirmation modal', () => {
    it('Given the delete button is rendered, When the user clicks it, Then a confirmation modal appears with the expected copy', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.getByText('¿Deseas eliminar esta guia?')).toBeInTheDocument();
      expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
      expect(screen.getByTestId('guide-db-delete-confirm')).toBeInTheDocument();
      expect(screen.getByTestId('guide-db-delete-cancel')).toBeInTheDocument();
    });

    it('Given the modal is open, When the user confirms, Then onDeleteGuide is called with the guide', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      const guide = createMockDbRecord();
      render(
        <GuideDbCard
          {...baseProps}
          guide={guide}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));
      await user.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(onDeleteGuide).toHaveBeenCalledTimes(1);
      });
      expect(onDeleteGuide).toHaveBeenCalledWith(guide, false);
    });

    it('Given the modal is open, When the user cancels, Then onDeleteGuide is not called', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));
      await user.click(screen.getByTestId('guide-db-delete-cancel'));

      expect(onDeleteGuide).not.toHaveBeenCalled();
      expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
    });
  });

  describe('Scenario: Hard-delete escalation for admin', () => {
    it('Given isAdmin, When the modal opens, Then the hard-delete checkbox is rendered', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          isAdmin
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.getByTestId('guide-db-hard-delete-checkbox')).toBeInTheDocument();
    });

    it('Given isAdmin is not set, When the modal opens, Then the hard-delete checkbox is not rendered', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));

      expect(screen.queryByTestId('guide-db-hard-delete-checkbox')).not.toBeInTheDocument();
    });

    it('Given isAdmin and the checkbox checked, When the user confirms, Then onDeleteGuide is called with permanent true', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      const guide = createMockDbRecord();
      render(
        <GuideDbCard
          {...baseProps}
          isAdmin
          guide={guide}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));
      await user.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      await user.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(onDeleteGuide).toHaveBeenCalledWith(guide, true);
      });
    });

    it('Given isAdmin and the checkbox checked, When the user confirms, Then the confirm button shows the hard-delete copy', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          isAdmin
          guide={createMockDbRecord()}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));
      expect(screen.getByTestId('guide-db-delete-confirm')).toHaveTextContent('Eliminar');

      await user.click(screen.getByTestId('guide-db-hard-delete-checkbox'));
      expect(screen.getByTestId('guide-db-delete-confirm')).toHaveTextContent('Eliminar permanentemente');
    });

    it('Given isAdmin and the checkbox unchecked, When the user confirms, Then onDeleteGuide is called with permanent false', async () => {
      const user = userEvent.setup();
      const onDeleteGuide = jest.fn();
      const guide = createMockDbRecord();
      render(
        <GuideDbCard
          {...baseProps}
          isAdmin
          guide={guide}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      await user.click(screen.getByTestId('guide-db-delete-button'));
      await user.click(screen.getByTestId('guide-db-delete-confirm'));

      await waitFor(() => {
        expect(onDeleteGuide).toHaveBeenCalledWith(guide, false);
      });
    });

    it('Given isAdmin and a soft-deleted guide, When the card renders, Then the delete button is visible', () => {
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          isAdmin
          guide={createMockDbRecord({ deletedAt: '2026-06-15T10:00:00Z', deletedBy: 'admin@example.com' })}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      expect(screen.getByTestId('guide-db-delete-button')).toBeInTheDocument();
    });

    it('Given non-admin and a soft-deleted guide, When the card renders, Then the delete button is hidden', () => {
      const onDeleteGuide = jest.fn();
      render(
        <GuideDbCard
          {...baseProps}
          guide={createMockDbRecord({ deletedAt: '2026-06-15T10:00:00Z', deletedBy: 'admin@example.com' })}
          onDeleteGuide={onDeleteGuide}
        />,
      );

      expect(screen.queryByTestId('guide-db-delete-button')).not.toBeInTheDocument();
    });
  });
});
