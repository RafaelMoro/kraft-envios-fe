import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ResultGuideDbScreen } from '@/features/Guides-DB/ResultGuideDbScreen'
import { CreateGuideDbResponseData } from '@/shared/types/guides.types'

const mockCloseModal = jest.fn()

const baseResult: CreateGuideDbResponseData = {
  status: 'created',
  kraftId: 'KRAFT-001',
  provider: 'GE',
  failureInfo: null,
}

describe('ResultGuideDbScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Given a transport/mutation error', () => {
    it('When isError is true, Then it shows a generic error message and finish button', () => {
      render(
        <ResultGuideDbScreen
          result={undefined}
          isSuccess={false}
          isError={true}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Error al crear la guía')).toBeInTheDocument()
      expect(
        screen.getByText('Ocurrió un error al crear la guía. Por favor, intente nuevamente.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument()
    })

    it('When isError has a custom errorMessage, Then it shows that message', () => {
      render(
        <ResultGuideDbScreen
          result={undefined}
          isSuccess={false}
          isError={true}
          errorMessage="Backend timeout"
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Backend timeout')).toBeInTheDocument()
    })

    it('When finish is clicked on error, Then it calls closeModal', async () => {
      const user = userEvent.setup()
      render(
        <ResultGuideDbScreen
          result={undefined}
          isSuccess={false}
          isError={true}
          closeModal={mockCloseModal}
        />,
      )

      await user.click(screen.getByRole('button', { name: /finalizar/i }))
      expect(mockCloseModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Given a successful DB creation with provider success', () => {
    it('When status is created, Then it shows success copy with kraftId and provider', () => {
      render(
        <ResultGuideDbScreen
          result={baseResult}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Guía creada con éxito')).toBeInTheDocument()
      expect(screen.getByText(/KRAFT-001/)).toBeInTheDocument()
      expect(screen.getByText(/GE/)).toBeInTheDocument()
      expect(screen.getByText(/guardó en Kraft y el proveedor/)).toBeInTheDocument()
    })

    it('When finish is clicked on success, Then it calls closeModal', async () => {
      const user = userEvent.setup()
      render(
        <ResultGuideDbScreen
          result={baseResult}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      await user.click(screen.getByRole('button', { name: /finalizar/i }))
      expect(mockCloseModal).toHaveBeenCalledTimes(1)
    })

    it('When isSuccess is true but status is failed, Then it does not render created success', () => {
      const failed: CreateGuideDbResponseData = {
        ...baseResult,
        status: 'failed',
        failureInfo: { errorCode: 'GDE-PVR-001', errorDetails: null },
      }
      render(
        <ResultGuideDbScreen
          result={failed}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.queryByText('Guía creada con éxito')).not.toBeInTheDocument()
    })
  })

  it('uses edit-specific headings for an update result', () => {
    render(
      <ResultGuideDbScreen
        mode="edit"
        result={baseResult}
        isSuccess
        isError={false}
        closeModal={mockCloseModal}
      />,
    )

    expect(screen.getByText('Guía editada con éxito')).toBeInTheDocument()
  })

  describe('Given HTTP 201 with status failed', () => {
    it('When status is failed with a known errorCode, Then it shows the friendly provider-failed copy', () => {
      const failed: CreateGuideDbResponseData = {
        status: 'failed',
        kraftId: 'KRAFT-002',
        provider: 'TONE',
        failureInfo: { errorCode: 'GDE-PVR-002', errorDetails: null },
      }
      render(
        <ResultGuideDbScreen
          result={failed}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Guía guardada en Kraft')).toBeInTheDocument()
      expect(
        screen.getByText(
          'La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte.',
        ),
      ).toBeInTheDocument()
    })

    it('When status is failed with an unknown errorCode, Then it shows the generic fallback copy', () => {
      const failed: CreateGuideDbResponseData = {
        status: 'failed',
        kraftId: 'KRAFT-003',
        provider: 'Pkk',
        failureInfo: { errorCode: 'XYZ-9999', errorDetails: null },
      }
      render(
        <ResultGuideDbScreen
          result={failed}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Guía guardada en Kraft')).toBeInTheDocument()
      expect(
        screen.getByText(
          'La guía se guardó en Kraft, pero ocurrió un error al crearla con el proveedor. Por favor, intente nuevamente.',
        ),
      ).toBeInTheDocument()
    })

    it('When status is failed with no failureInfo, Then it shows the generic fallback copy', () => {
      const failed: CreateGuideDbResponseData = {
        status: 'failed',
        kraftId: 'KRAFT-004',
        provider: 'Mn',
        failureInfo: null,
      }
      render(
        <ResultGuideDbScreen
          result={failed}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.getByText('Guía guardada en Kraft')).toBeInTheDocument()
      expect(
        screen.getByText(
          'La guía se guardó en Kraft, pero ocurrió un error al crearla con el proveedor. Por favor, intente nuevamente.',
        ),
      ).toBeInTheDocument()
    })

    it('When result is failed, Then it does not render a retry button', () => {
      const failed: CreateGuideDbResponseData = {
        status: 'failed',
        kraftId: 'KRAFT-005',
        provider: 'GE',
        failureInfo: { errorCode: 'GDE-NET-001', errorDetails: null },
      }
      render(
        <ResultGuideDbScreen
          result={failed}
          isSuccess={true}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.queryByRole('button', { name: /reintentar|retry/i })).not.toBeInTheDocument()
    })
  })

  describe('Given a no-op state', () => {
    it('When neither success nor error, Then it renders nothing actionable', () => {
      render(
        <ResultGuideDbScreen
          result={undefined}
          isSuccess={false}
          isError={false}
          closeModal={mockCloseModal}
        />,
      )

      expect(screen.queryByText('Guía creada con éxito')).not.toBeInTheDocument()
      expect(screen.queryByText('Guía guardada en Kraft')).not.toBeInTheDocument()
      expect(screen.queryByText('Error al crear la guía')).not.toBeInTheDocument()
    })
  })
})
