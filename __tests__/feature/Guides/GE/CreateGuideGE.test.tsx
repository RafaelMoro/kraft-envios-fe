import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CreateGuideGE } from '@/features/Guides/GE/CreateGuideGE'
import { QuoteUI } from '@/shared/types/quotes.types'
import { PackageDimensions } from '@/shared/types/guides.types'

// Mock the child components
jest.mock('../../../../src/features/Guides/GE/AddAddressGE', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AddAddressGE: ({ typeAddress, goNext, goPrev, toggleModal, updateAddress }: any) => (
    <div data-testid={`add-address-${typeAddress}`}>
      <p>Add Address {typeAddress}</p>
      <button onClick={() => {
        const mockData = {
          address: { alias: typeAddress === 'origin' ? 'Casa' : 'Oficina' },
          information: {
            addressName: 'Test Street',
            externalNumber: '123',
            internalNumber: '4',
            neighborhood: 'Test Neighborhood',
            city: 'Test City',
            state: 'Test State',
            zipcode: '12345'
          }
        }
        const result = updateAddress(mockData)
        if (result) goNext()
      }}>Next</button>
      <button onClick={() => typeAddress === 'origin' ? toggleModal() : goPrev()}>
        {typeAddress === 'origin' ? 'Cancel' : 'Back'}
      </button>
    </div>
  )
}))

jest.mock('../../../../src/features/Guides/GE/ParcelInfoFormGE', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ParcelInfoFormGE: ({ goNext, goPrev, updateParcelInfo, children }: any) => (
    <div data-testid="parcel-info-form">
      <p>Parcel Info Form</p>
      {children}
      <button onClick={() => {
        updateParcelInfo({
          content: 'Test content',
          satProductId: '12345',
          length: '30',
          width: '20',
          height: '10',
          weight: '5'
        })
        goNext()
      }}>Next</button>
      <button onClick={goPrev}>Back</button>
    </div>
  )
}))

jest.mock('../../../../src/features/Guides/Mn/ProductSatDropdown', () => ({
  ProductSatDropdown: () => <div data-testid="product-sat-dropdown">Product SAT Dropdown</div>
}))

jest.mock('../../../../src/features/Guides/GE/ConfirmGuideGE', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ConfirmGuideGE: ({ goPrev, createGuide, isPending }: any) => (
    <div data-testid="confirm-guide">
      <p>Confirm Guide</p>
      <p>Is Pending: {isPending ? 'true' : 'false'}</p>
      <button onClick={() => createGuide({ quoteId: 'test-quote-id' })}>Create Guide</button>
      <button onClick={goPrev}>Back</button>
    </div>
  )
}))

jest.mock('../../../../src/features/Guides/ResultGuideScreen', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResultGuideScreen: ({ isSuccess, isError, closeModal }: any) => (
    <div data-testid="result-guide-screen">
      <p>Result Screen</p>
      <p>Success: {isSuccess ? 'true' : 'false'}</p>
      <p>Error: {isError ? 'true' : 'false'}</p>
      <button onClick={closeModal}>Close</button>
    </div>
  )
}))

// Mock the utils
jest.mock('../../../../src/shared/utils/guides.utils', () => ({
  createGuideGECb: jest.fn()
}))

// Mock hooks
jest.mock('../../../../src/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn()
}))

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

const mockSelectedQuotes: QuoteUI[] = [
  {
    id: 'quote-123',
    service: 'Estandar',
    serviceName: 'Estandar',
    total: 150,
    typeService: 'standard',
    courier: 'Estafeta',
    source: 'GE',
    amountFormatted: '$150.00 MXN',
    logoSrc: {
      source: '/img/estafeta.png',
      provider: 'estafeta',
      width: 100,
      height: 50
    }
  }
]

const mockPackageDimensions: PackageDimensions = {
  length: '30',
  width: '20',
  height: '10',
  weight: '5'
}

const CreateGuideGEWrapper = ({
  open = true,
  packageDimensions = mockPackageDimensions,
  selectedQuotes = mockSelectedQuotes,
  toggleModal = jest.fn(),
  resetSelectedQuotes = jest.fn()
}: Partial<React.ComponentProps<typeof CreateGuideGE>>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <CreateGuideGE
        open={open}
        packageDimensions={packageDimensions}
        selectedQuotes={selectedQuotes}
        toggleModal={toggleModal}
        resetSelectedQuotes={resetSelectedQuotes}
      />
    </QueryClientProvider>
  )
}

describe('Feature: Create Guide GE', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseMediaQuery.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isTabletDesktop: false,
      isMobileTablet: false,
      isDesktop: true,
      isDesktopX2: false
    })
  })

  describe('Scenario: Modal visibility', () => {
    it('Given open is true, When the component renders, Then the modal should be visible with title', () => {
      render(<CreateGuideGEWrapper open={true} />)

      expect(screen.getByText('Crear guía GE')).toBeInTheDocument()
    })

    it('Given open is false, When the component renders, Then the modal should not be visible', () => {
      render(<CreateGuideGEWrapper open={false} />)

      expect(screen.queryByText('Crear guía GE')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Stepper visibility', () => {
    it('Given isMobileTablet is false, When the component renders, Then the stepper should be visible', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: false,
        isDesktop: true,
        isDesktopX2: false
      })

      render(<CreateGuideGEWrapper />)

      // Verify stepper is present by checking for step text
      expect(screen.getByText('Remitente')).toBeInTheDocument()
      expect(screen.getByText('Destinatario')).toBeInTheDocument()
      expect(screen.getByText('Paquete')).toBeInTheDocument()
      expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })

    it('Given isMobileTablet is true, When the component renders, Then the stepper should not be visible', () => {
      mockedUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTabletDesktop: false,
        isMobileTablet: true,
        isDesktop: false,
        isDesktopX2: false
      })

      render(<CreateGuideGEWrapper />)

      expect(screen.queryByTestId('stepper')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Step 1 - Origin address', () => {
    it('Given the modal opens, When step is 1, Then it should display origin address component', () => {
      render(<CreateGuideGEWrapper />)

      expect(screen.getByTestId('add-address-origin')).toBeInTheDocument()
      expect(screen.getByText('Add Address origin')).toBeInTheDocument()
    })

    it('Given user completes origin address, When next is clicked, Then it should navigate to step 2', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('add-address-destination')).toBeInTheDocument()
      })
    })

    it('Given user clicks cancel on origin address, When cancel is clicked, Then it should call toggleModal', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      render(<CreateGuideGEWrapper toggleModal={toggleModal} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(toggleModal).toHaveBeenCalled()
    })
  })

  describe('Scenario: Step 2 - Destination address', () => {
    it('Given user is on step 2, When the component renders, Then it should display destination address component', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('add-address-destination')).toBeInTheDocument()
        expect(screen.getByText('Add Address destination')).toBeInTheDocument()
      })
    })

    it('Given user completes destination address, When next is clicked, Then it should navigate to step 3', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 2
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('add-address-destination')).toBeInTheDocument()
      })

      // Click next on destination
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })
    })

    it('Given user is on step 2, When back is clicked, Then it should navigate back to step 1', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 2
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('add-address-destination')).toBeInTheDocument()
      })

      // Click back
      await user.click(screen.getByRole('button', { name: /back/i }))

      await waitFor(() => {
        expect(screen.getByTestId('add-address-origin')).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Step 3 - Parcel information', () => {
    it('Given user is on step 3, When the component renders, Then it should display parcel info form with product dropdown', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
        expect(screen.getByText('Parcel Info Form')).toBeInTheDocument()
        expect(screen.getByTestId('product-sat-dropdown')).toBeInTheDocument()
      })
    })

    it('Given user completes parcel info, When next is clicked, Then it should navigate to step 4', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })

      // Complete parcel info
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })
    })

    it('Given user is on step 3, When back is clicked, Then it should navigate back to step 2', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })

      // Click back
      await user.click(screen.getByRole('button', { name: /back/i }))

      await waitFor(() => {
        expect(screen.getByTestId('add-address-destination')).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Step 4 - Confirmation', () => {
    it('Given user is on step 4, When the component renders, Then it should display confirmation screen', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 4
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
        expect(screen.getByText('Confirm Guide')).toBeInTheDocument()
      })
    })

    it('Given user is on step 4, When back is clicked, Then it should navigate back to step 3', async () => {
      const user = userEvent.setup()
      render(<CreateGuideGEWrapper />)

      // Navigate to step 4
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })

      // Click back
      await user.click(screen.getByRole('button', { name: /back/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Step 5 - Result screen after successful guide creation', () => {
    it('Given user creates guide successfully, When mutation succeeds, Then it should display success result screen', async () => {
      const user = userEvent.setup()
      const { createGuideGECb } = await import('../../../../src/shared/utils/guides.utils')
      const mockedCreateGuide = createGuideGECb as jest.MockedFunction<typeof createGuideGECb>
      
      mockedCreateGuide.mockResolvedValue({
        trackingNumber: 'GE123456',
        carrier: 'Estafeta',
        source: 'GE',
        price: '150.00',
        guideLink: 'https://example.com/guide',
        labelUrl: 'https://example.com/label.pdf',
        file: null
      })

      render(<CreateGuideGEWrapper />)

      // Navigate to step 4
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })

      // Create guide
      await user.click(screen.getByRole('button', { name: /create guide/i }))

      await waitFor(() => {
        expect(screen.getByTestId('result-guide-screen')).toBeInTheDocument()
        expect(screen.getByText('Success: true')).toBeInTheDocument()
        expect(screen.getByText('Error: false')).toBeInTheDocument()
      })
    })

    it('Given user creates guide with error, When mutation fails, Then it should display error result screen', async () => {
      const user = userEvent.setup()
      const { createGuideGECb } = await import('../../../../src/shared/utils/guides.utils')
      const mockedCreateGuide = createGuideGECb as jest.MockedFunction<typeof createGuideGECb>
      
      mockedCreateGuide.mockRejectedValue(new Error('Failed to create guide'))

      render(<CreateGuideGEWrapper />)

      // Navigate to step 4
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })

      // Create guide
      await user.click(screen.getByRole('button', { name: /create guide/i }))

      await waitFor(() => {
        expect(screen.getByTestId('result-guide-screen')).toBeInTheDocument()
        expect(screen.getByText('Success: false')).toBeInTheDocument()
        expect(screen.getByText('Error: true')).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Close modal and reset state', () => {
    it('Given user is on result screen, When close button is clicked, Then it should call toggleModal and resetSelectedQuotes', async () => {
      const user = userEvent.setup()
      const toggleModal = jest.fn()
      const resetSelectedQuotes = jest.fn()
      const { createGuideGECb } = await import('../../../../src/shared/utils/guides.utils')
      const mockedCreateGuide = createGuideGECb as jest.MockedFunction<typeof createGuideGECb>
      
      mockedCreateGuide.mockResolvedValue({
        trackingNumber: 'GE123456',
        carrier: 'Estafeta',
        source: 'GE',
        price: '150.00',
        guideLink: 'https://example.com/guide',
        labelUrl: 'https://example.com/label.pdf',
        file: null
      })

      render(
        <CreateGuideGEWrapper
          toggleModal={toggleModal}
          resetSelectedQuotes={resetSelectedQuotes}
        />
      )

      // Navigate to step 4 and create guide
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /create guide/i }))

      await waitFor(() => {
        expect(screen.getByTestId('result-guide-screen')).toBeInTheDocument()
      })

      // Close modal - use the Close button from ResultGuideScreen, not the modal X button
      const closeButtons = screen.getAllByRole('button', { name: /close/i })
      await user.click(closeButtons[1]) // Second close button is from ResultGuideScreen

      expect(toggleModal).toHaveBeenCalled()
      expect(resetSelectedQuotes).toHaveBeenCalled()
    })
  })

  describe('Scenario: Package dimensions integration', () => {
    it('Given packageDimensions is provided, When parcel info is updated, Then it should merge dimensions with content and satProductId', async () => {
      const user = userEvent.setup()
      const customPackageDimensions: PackageDimensions = {
        length: '50',
        width: '40',
        height: '30',
        weight: '10'
      }

      render(<CreateGuideGEWrapper packageDimensions={customPackageDimensions} />)

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })

      // Complete parcel info
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })
    })

    it('Given packageDimensions is null, When parcel info is updated, Then it should log a warning', async () => {
      const user = userEvent.setup()
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      render(<CreateGuideGEWrapper packageDimensions={null} />)

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('parcel-info-form')).toBeInTheDocument()
      })

      // Complete parcel info
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('No package dimensions available to update parcel info')
      })

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Scenario: Mutation loading state', () => {
    it('Given guide is being created, When mutation is pending, Then ConfirmGuideGE should receive isPending as true', async () => {
      const user = userEvent.setup()
      const { createGuideGECb } = await import('../../../../src/shared/utils/guides.utils')
      const mockedCreateGuide = createGuideGECb as jest.MockedFunction<typeof createGuideGECb>
      
      // Create a promise that we can control
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockedCreateGuide.mockReturnValue(pendingPromise as Promise<any>)

      render(<CreateGuideGEWrapper />)

      // Navigate to step 4
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-guide')).toBeInTheDocument()
      })

      // Verify initial pending state is false
      expect(screen.getByText('Is Pending: false')).toBeInTheDocument()

      // Create guide
      await user.click(screen.getByRole('button', { name: /create guide/i }))

      // Verify pending state becomes true
      await waitFor(() => {
        expect(screen.getByText('Is Pending: true')).toBeInTheDocument()
      })

      // Resolve the promise to cleanup
      resolvePromise!({
        trackingNumber: 'GE123456',
        carrier: 'Estafeta',
        source: 'GE',
        price: '150.00',
        guideLink: 'https://example.com/guide',
        labelUrl: 'https://example.com/label.pdf',
        file: null
      })
    })
  })
})
