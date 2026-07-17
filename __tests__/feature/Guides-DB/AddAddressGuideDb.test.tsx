import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AddAddressGuideDb } from '@/features/Guides-DB/AddAddressGuideDb'
import { AliasSavedMn, CreateGuideAddressFormValuesMn } from '@/shared/types/guides.types'
import { mockMatchMedia, QueryMatchMedia } from '../../utils-test/mockWatchMedia'

jest.mock('../../../src/shared/hooks/useGetAddress', () => ({
  useGetAddress: jest.fn(),
}))

import { useGetAddress } from '@/shared/hooks/useGetAddress'

const mockedUseGetAddress = useGetAddress as jest.MockedFunction<typeof useGetAddress>

const mockGoNext = jest.fn()
const mockGoPrev = jest.fn()
const mockToggleModal = jest.fn()
const mockUpdateAddress = jest.fn()
const mockUpdateSavedAlias = jest.fn()

const aliasSavedOrigin: AliasSavedMn = {
  alias: 'Casa',
  town: 'Cuauhtémoc',
  city: 'CDMX',
  address: {
    addressName: 'Calle Principal',
    externalNumber: '123',
    internalNumber: '',
    reference: '',
    zipcode: '06000',
    state: 'CDMX',
    city: ['Ciudad de México'],
    town: ['Cuauhtémoc'],
    alias: 'Casa',
    neighborhood: 'Centro',
  },
  addressMn: {
    street1: 'Calle Principal',
    external_number: '123',
    neighborhood: 'Centro',
    city: 'CDMX',
    state: 'CDMX',
    reference: '',
  },
}

const aliasSavedDestination: AliasSavedMn = {
  alias: 'Casa',
  town: 'Cuauhtémoc',
  city: 'CDMX',
  address: { ...aliasSavedOrigin.address },
  addressMn: { ...aliasSavedOrigin.addressMn },
}

const addressData: CreateGuideAddressFormValuesMn = {
  alias: 'Casa',
  name: 'Juan',
  lastName: 'Pérez',
  phone: '5551234567',
  email: 'juan@example.com',
  company: 'Mi Empresa',
  street1: 'Calle Principal',
  external_number: '123',
  neighborhood: 'Centro',
  city: 'CDMX',
  state: 'CDMX',
  reference: '',
}

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

const renderComponent = (props: { excludedAlias?: string; aliasSaved?: AliasSavedMn; initialUseTempAddress?: boolean }) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AddAddressGuideDb
        title="Domicilio destino"
        addressData={addressData}
        aliasSaved={props.aliasSaved ?? aliasSavedDestination}
        isMobileTablet={false}
        isDestination
        excludedAlias={props.excludedAlias}
        goNext={mockGoNext}
        goPrev={mockGoPrev}
        toggleModal={mockToggleModal}
        updateAddress={mockUpdateAddress}
        updateSavedAlias={mockUpdateSavedAlias}
        initialUseTempAddress={props.initialUseTempAddress}
      />
    </QueryClientProvider>,
  )
}

describe('AddAddressGuideDb - destination vs origin guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia({ [QueryMatchMedia.isDesktop]: true })
    mockedUseGetAddress.mockReturnValue({
      data: [aliasSavedOrigin.address],
      isPending: false,
      isError: false,
      error: null,
    } as never)
  })

  it('opens the prefilled manual address form when requested', () => {
    renderComponent({ initialUseTempAddress: true })

    expect(screen.getByTestId('street1')).toHaveValue('Calle Principal')
  })

  it('When the destination alias equals the excluded origin alias, Then it shows a same-address error on submit', async () => {
    const user = userEvent.setup()
    renderComponent({ excludedAlias: 'Casa', aliasSaved: { ...aliasSavedDestination, alias: 'Casa' } })

    const submitButton = screen.getByTestId('destination-address-guide-db-next-button')
    await user.click(submitButton)

    expect(mockGoNext).not.toHaveBeenCalled()
    expect(
      screen.getByText('El domicilio destino no puede ser el mismo que el origen'),
    ).toBeInTheDocument()
  })

  it('When the destination alias differs from the excluded origin alias, Then it proceeds', async () => {
    const user = userEvent.setup()
    renderComponent({ excludedAlias: 'Casa', aliasSaved: { ...aliasSavedDestination, alias: 'Oficina' } })

    const submitButton = screen.getByTestId('destination-address-guide-db-next-button')
    await user.click(submitButton)

    expect(mockGoNext).toHaveBeenCalled()
  })

  it('When town is missing on the saved address, Then it blocks submit with a town error', async () => {
    const user = userEvent.setup()
    renderComponent({
      excludedAlias: 'Otra',
      aliasSaved: { ...aliasSavedDestination, alias: 'Oficina', town: '' },
    })

    const submitButton = screen.getByTestId('destination-address-guide-db-next-button')
    await user.click(submitButton)

    expect(mockGoNext).not.toHaveBeenCalled()
    expect(mockUpdateAddress).not.toHaveBeenCalled()
    expect(screen.getByText('Por favor selecciona un municipio')).toBeInTheDocument()
  })

  it('When a valid saved address is submitted, Then updateAddress receives alias, zipcode, and town from the saved address', async () => {
    const user = userEvent.setup()
    renderComponent({
      excludedAlias: 'Otra',
      aliasSaved: {
        ...aliasSavedDestination,
        alias: 'Oficina',
        town: 'Cuauhtémoc',
        address: {
          ...aliasSavedDestination.address,
          alias: 'Oficina',
          zipcode: '06600',
        },
      },
    })

    const submitButton = screen.getByTestId('destination-address-guide-db-next-button')
    await user.click(submitButton)

    expect(mockUpdateAddress).toHaveBeenCalledTimes(1)
    const submitted = mockUpdateAddress.mock.calls[0][0]
    expect(submitted.alias).toBe('Oficina')
    expect(submitted.zipcode).toBe('06600')
    expect(submitted.town).toBe('Cuauhtémoc')
  })
})
