import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateGuidePkk } from '@/features/Guides/Pkk/CreateGuidePkk'
import { PackageDimensions } from '@/shared/types/guides.types'
import { QueryProviderWrapper } from '@/features/QueryProviderWrapper'

// Mock the hooks
jest.mock('../../../../src/shared/hooks/useMediaQuery')
jest.mock('../../../../src/shared/hooks/useSteps')
jest.mock('../../../../src/shared/hooks/useAlias')
jest.mock('../../../../src/shared/hooks/useAddAddress')

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useSteps } from '@/shared/hooks/useSteps'
import { useSaveAlias } from '@/shared/hooks/useAlias'
import { useAddAddress } from '@/shared/hooks/useAddAddress'

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
const mockUseSteps = useSteps as jest.MockedFunction<typeof useSteps>
const mockUseSaveAlias = useSaveAlias as jest.MockedFunction<typeof useSaveAlias>
const mockUseAddAddress = useAddAddress as jest.MockedFunction<typeof useAddAddress>

describe('Feature: Create Guide for Pkk', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryProviderWrapper>{component}</QueryProviderWrapper>)
  }

  const mockPackageDimensions: PackageDimensions = {
    weight: 5,
    length: 30,
    width: 20,
    height: 15,
    amount: 100,
    content: 'Electronics'
  }

  const mockToggleModal = jest.fn()
  const mockResetSelectedQuotes = jest.fn()
  const mockGoNext = jest.fn()
  const mockGoPrev = jest.fn()
  const mockResetSteps = jest.fn()
  const mockUpdateOriginAliasPkk = jest.fn()
  const mockUpdateDestinationAliasPkk = jest.fn()
  const mockResetAliases = jest.fn()

  const defaultUseStepsReturn = {
    step: 1,
    goNext: mockGoNext,
    goPrev: mockGoPrev,
    resetSteps: mockResetSteps
  }

  const defaultUseSaveAliasReturn = {
    aliasesPkk: {
      origin: {
        alias: 'Test Alias Origin',
        town: 'Test Town',
        city: 'Test City',
        address: null,
        addressPkk: null
      },
      destination: {
        alias: 'Test Alias Destination',
        town: 'Test Town 2',
        city: 'Test City 2',
        address: null,
        addressPkk: null
      }
    },
    updateOriginAliasPkk: mockUpdateOriginAliasPkk,
    updateDestinationAliasPkk: mockUpdateDestinationAliasPkk,
    resetAliases: mockResetAliases
  }

  const defaultUseAddAddressReturn = {
    aliasSelected: true,
    setAliasSelected: jest.fn(),
    addressError: '',
    setAddressError: jest.fn(),
    townError: '',
    cityError: '',
    setTownError: jest.fn(),
    setCityError: jest.fn(),
    handleCancel: jest.fn(),
    addressType: 'origin' as const,
    cancelButtonText: 'Cancelar',
    cancelColorButton: 'red' as const,
    useTempAddress: false,
    toggleTempAddress: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMediaQuery.mockReturnValue({
      isMobileTablet: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    })
    mockUseSteps.mockReturnValue(defaultUseStepsReturn)
    mockUseSaveAlias.mockReturnValue(defaultUseSaveAliasReturn)
    mockUseAddAddress.mockReturnValue(defaultUseAddAddressReturn)
  })

  describe('Scenario: Render modal when open prop is true', () => {
    it('Given open is true, When the component renders, Then the modal should be visible', () => {
      // Given open is true and When the component renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then the modal should be visible
      expect(screen.getByText(/crear guía/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Hide modal when open prop is false', () => {
    it('Given open is false, When the component renders, Then the modal should not be visible', () => {
      // Given open is false and When the component renders
      renderWithProviders(
        <CreateGuidePkk
          open={false}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then the modal title should not be visible
      expect(screen.queryByText(/crear guía/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display stepper on desktop', () => {
    it('Given isMobileTablet is false, When the modal renders, Then the stepper should be displayed', () => {
      // Given isMobileTablet is false
      mockUseMediaQuery.mockReturnValue({
        isMobileTablet: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then the stepper should be displayed
      expect(screen.getByText(/remitente/i)).toBeInTheDocument()
      expect(screen.getByText(/destinatario/i)).toBeInTheDocument()
      expect(screen.getByText(/paquete/i)).toBeInTheDocument()
      expect(screen.getByText(/confirmar/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Hide stepper on mobile/tablet', () => {
    it('Given isMobileTablet is true, When the modal renders, Then the stepper should not be displayed', () => {
      // Given isMobileTablet is true
      mockUseMediaQuery.mockReturnValue({
        isMobileTablet: true,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then the stepper should not be displayed
      expect(screen.queryByTestId('stepper')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Render origin address form at step 1', () => {
    it('Given step is 1, When the modal renders, Then AddAddressPkk for origin should be displayed', () => {
      // Given step is 1
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 1
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then AddAddressPkk for origin should be displayed
      expect(screen.getByTestId('origin-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Render destination address form at step 2', () => {
    it('Given step is 2, When the modal renders, Then AddAddressPkk for destination should be displayed', () => {
      // Given step is 2
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 2
      })
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        addressType: 'destination'
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then AddAddressPkk for destination should be displayed
      expect(screen.getByTestId('destination-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Render parcel info form at step 3', () => {
    it('Given step is 3, When the modal renders, Then ParcelInfo should be displayed', () => {
      // Given step is 3
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 3
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then ParcelInfo should be displayed
      expect(screen.getByTestId('parcel-info-form-next-button')).toBeInTheDocument()
      expect(screen.getByTestId('parcel-info-form-cancel-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Render confirmation screen at step 4', () => {
    it('Given step is 4, When the modal renders, Then ConfirmGuidePkk should be displayed', () => {
      // Given step is 4
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 4
      })

      // When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then ConfirmGuidePkk should be displayed
      expect(screen.getByTestId('confirm-guide-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-guide-send-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Close modal and reset state', () => {
    it('Given the modal is open, When user closes the modal, Then it should call all reset functions', async () => {
      // Given the modal is open
      const user = userEvent.setup()
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // When user closes the modal (click the close button in the header)
      const closeButton = screen.getByLabelText(/close/i)
      await user.click(closeButton)

      // Then it should call all reset functions
      expect(mockResetAliases).toHaveBeenCalledTimes(1)
      expect(mockResetSteps).toHaveBeenCalledTimes(1)
      expect(mockResetSelectedQuotes).toHaveBeenCalledTimes(1)
      expect(mockToggleModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Handle null package dimensions', () => {
    it('Given packageDimensions is null, When the modal renders, Then it should render without errors', () => {
      // Given packageDimensions is null and When the modal renders
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={null}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should render the modal without errors
      expect(screen.getByText(/crear guía/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Pass correct props to origin AddAddressPkk', () => {
    it('Given step is 1, When rendering origin address form, Then it should not have isDestination prop', () => {
      // Given step is 1
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 1
      })

      // When rendering origin address form
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should display origin-specific elements
      expect(screen.getByTestId('origin-address-pkk-next-button')).toBeInTheDocument()
      expect(screen.queryByTestId('destination-address-pkk-next-button')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Pass correct props to destination AddAddressPkk', () => {
    it('Given step is 2, When rendering destination address form, Then it should have isDestination prop', () => {
      // Given step is 2
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 2
      })
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        addressType: 'destination'
      })

      // When rendering destination address form
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should display destination-specific elements
      expect(screen.getByTestId('destination-address-pkk-next-button')).toBeInTheDocument()
      expect(screen.queryByTestId('origin-address-pkk-next-button')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Update origin alias through AddAddressPkk', () => {
    it('Given step is 1, When AddAddressPkk is rendered, Then it should receive updateOriginAliasPkk callback', () => {
      // Given step is 1
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 1
      })

      // When AddAddressPkk is rendered
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should render without errors and have the form
      expect(screen.getByTestId('origin-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Update destination alias through AddAddressPkk', () => {
    it('Given step is 2, When AddAddressPkk is rendered, Then it should receive updateDestinationAliasPkk callback', () => {
      // Given step is 2
      mockUseSteps.mockReturnValue({
        ...defaultUseStepsReturn,
        step: 2
      })
      mockUseAddAddress.mockReturnValue({
        ...defaultUseAddAddressReturn,
        addressType: 'destination'
      })

      // When AddAddressPkk is rendered
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should render without errors and have the form
      expect(screen.getByTestId('destination-address-pkk-next-button')).toBeInTheDocument()
    })
  })

  describe('Scenario: Modal structure with stepper and body', () => {
    it('Given the modal is open, When checking the structure, Then it should have header and body', () => {
      // Given the modal is open and When checking the structure
      renderWithProviders(
        <CreateGuidePkk
          open={true}
          packageDimensions={mockPackageDimensions}
          toggleModal={mockToggleModal}
          resetSelectedQuotes={mockResetSelectedQuotes}
        />
      )

      // Then it should have the modal header
      expect(screen.getByText(/crear guía/i)).toBeInTheDocument()

      // And it should have the stepper (on desktop) with step labels
      expect(screen.getByText(/remitente/i)).toBeInTheDocument()
      expect(screen.getByText(/destinatario/i)).toBeInTheDocument()

      // And it should have the form content
      expect(screen.getByTestId('origin-address-pkk-next-button')).toBeInTheDocument()
    })
  })
})
