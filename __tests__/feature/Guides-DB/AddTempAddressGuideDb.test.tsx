import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AddTempAddressGuideDb } from '@/features/Guides-DB/AddTempAddressGuideDb'
import { initialStateAddressForm } from '@/shared/constants/guides.constants'
import { CreateGuideAddressFormValuesMn } from '@/shared/types/guides.types'
import { mockMatchMedia, QueryMatchMedia } from '../../utils-test/mockWatchMedia'

jest.mock('../../../src/shared/hooks/useGetAddress', () => ({
  useGetAddress: jest.fn(),
}))

import { useGetAddress } from '@/shared/hooks/useGetAddress'
const mockedUseGetAddress = useGetAddress as jest.MockedFunction<typeof useGetAddress>

const mockGoNext = jest.fn()
const mockUpdateAddress = jest.fn()
const mockToggleTempAddress = jest.fn()

const editAddress: CreateGuideAddressFormValuesMn = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Perez',
  phone: '5512345678',
  email: 'juan@example.com',
  company: 'Kraft Envios',
  street1: 'Calle Uno',
  external_number: '12',
  neighborhood: 'Centro',
  city: 'CDMX',
  town: 'Cuauhtemoc',
  state: 'CDMX',
  zipcode: '01000',
  reference: 'Puerta azul',
}

const renderComponent = (props = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const merged = {
    title: 'Domicilio origen',
    addressData: initialStateAddressForm,
    addressType: 'origin' as 'origin' | 'destination',
    isMobileTablet: false,
    goNext: mockGoNext,
    updateAddress: mockUpdateAddress,
    toggleTempAddress: mockToggleTempAddress,
    ...props,
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <AddTempAddressGuideDb {...merged} />
    </QueryClientProvider>,
  )
}

describe('AddTempAddressGuideDb', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia({ [QueryMatchMedia.isDesktop]: true })
    mockedUseGetAddress.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    } as never)
  })

  describe('Rendering', () => {
    it('When rendered, Then it shows the mandatory alias and town fields', () => {
      renderComponent()

      expect(screen.getByLabelText(/^alias$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^municipio$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/calle/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numero exterior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/referencia del domicilio/i)).toBeInTheDocument()
    })

    it('When rendered for origin, Then it shows the origin test ids on the action buttons', () => {
      renderComponent({ addressType: 'origin' })

      expect(screen.getByTestId('origin-address-guide-db-temp-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('origin-address-guide-db-temp-next-button')).toBeInTheDocument()
    })

    it('When rendered for destination, Then it shows the destination test ids on the action buttons', () => {
      renderComponent({ addressType: 'destination' })

      expect(screen.getByTestId('destination-address-guide-db-temp-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('destination-address-guide-db-temp-next-button')).toBeInTheDocument()
    })

    it('When isMobileTablet is true, Then it shows the title heading', () => {
      renderComponent({ isMobileTablet: true, title: 'Domicilio móvil' })

      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Domicilio móvil')
    })
  })

  describe('Cancel behavior', () => {
    it('When the cancel button is clicked, Then it calls toggleTempAddress and not the submit handlers', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByTestId('origin-address-guide-db-temp-cancel-button'))

      expect(mockToggleTempAddress).toHaveBeenCalledTimes(1)
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Mandatory alias and town validation', () => {
    const fillPersonalData = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByTestId('name'), 'Juan')
      await user.type(screen.getByTestId('lastName'), 'Pérez')
      await user.type(screen.getByTestId('phone'), '5551234567')
    }

    const switchToManualAndFillAddress = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByLabelText(/completar región manualmente/i))
      await user.type(screen.getByTestId('street1'), 'Av Reforma')
      await user.type(screen.getByTestId('external_number'), '123')
      await user.type(screen.getByTestId('neighborhood'), 'Juárez')
      await user.type(screen.getByTestId('city'), 'CDMX')
      await user.type(screen.getByTestId('state'), 'CDMX')
    }

    it('When alias is empty (but the rest is filled), Then it blocks submit and shows the alias error', async () => {
      const user = userEvent.setup()
      renderComponent()

      await fillPersonalData(user)
      await switchToManualAndFillAddress(user)
      await user.click(screen.getByTestId('origin-address-guide-db-temp-next-button'))

      expect(await screen.findByText('Alias es requerido')).toBeInTheDocument()
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })

    it('When town is empty (but the rest is filled), Then it blocks submit and shows the town error', async () => {
      const user = userEvent.setup()
      renderComponent()

      await fillPersonalData(user)
      await switchToManualAndFillAddress(user)
      await user.type(screen.getByTestId('alias'), 'Casa')
      await user.click(screen.getByTestId('origin-address-guide-db-temp-next-button'))

      expect(await screen.findByText('Municipio es requerido')).toBeInTheDocument()
      expect(mockUpdateAddress).not.toHaveBeenCalled()
      expect(mockGoNext).not.toHaveBeenCalled()
    })
  })

  describe('Happy path', () => {
    it('advances an unchanged edit address without revalidating its prefilled region', async () => {
      const user = userEvent.setup()
      renderComponent({ addressData: editAddress, editMode: true })

      await user.click(screen.getByTestId('origin-address-guide-db-temp-next-button'))

      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith(editAddress)
      })
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByTestId('name'), 'Juan')
      await user.type(screen.getByTestId('lastName'), 'Pérez')
      await user.type(screen.getByTestId('phone'), '5551234567')
      await user.type(screen.getByTestId('alias'), 'Oficina')
      await user.type(screen.getByTestId('town'), 'Cuauhtémoc')
      await user.click(screen.getByLabelText(/completar región manualmente/i))
      await user.type(screen.getByTestId('street1'), 'Av Reforma')
      await user.type(screen.getByTestId('external_number'), '123')
      await user.type(screen.getByTestId('neighborhood'), 'Juárez')
      await user.type(screen.getByTestId('city'), 'CDMX')
      await user.type(screen.getByTestId('state'), 'CDMX')
    }

    it('When all required fields are filled, Then it calls updateAddress with alias/town/zipcode and goNext', async () => {
      const user = userEvent.setup()
      renderComponent()

      await fillRequiredFields(user)
      await user.click(screen.getByTestId('origin-address-guide-db-temp-next-button'))

      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledTimes(1)
      })
      const submitted = mockUpdateAddress.mock.calls[0][0]
      expect(submitted.alias).toBe('Oficina')
      expect(submitted.town).toBe('Cuauhtémoc')
      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })

    it('When alias is whitespace but town is valid, Then it shows the alias error', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.type(screen.getByTestId('name'), 'Juan')
      await user.type(screen.getByTestId('lastName'), 'Pérez')
      await user.type(screen.getByTestId('phone'), '5551234567')
      await user.click(screen.getByLabelText(/completar región manualmente/i))
      await user.type(screen.getByTestId('street1'), 'Av Reforma')
      await user.type(screen.getByTestId('external_number'), '123')
      await user.type(screen.getByTestId('neighborhood'), 'Juárez')
      await user.type(screen.getByTestId('city'), 'CDMX')
      await user.type(screen.getByTestId('state'), 'CDMX')
      await user.type(screen.getByTestId('alias'), '   ')
      await user.type(screen.getByTestId('town'), 'Cuauhtémoc')
      await user.click(screen.getByTestId('origin-address-guide-db-temp-next-button'))

      expect(await screen.findByText('Alias es requerido')).toBeInTheDocument()
      expect(mockUpdateAddress).not.toHaveBeenCalled()
    })
  })
})
