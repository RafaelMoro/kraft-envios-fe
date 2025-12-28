import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmGuidePkk } from '@/features/Guides/Pkk/ConfirmGuidePkk'
import { CreateGuideFormValuesPkk } from '@/shared/types/guides.types'

describe('Feature: Confirm Guide for Pkk', () => {
  const mockFormData: CreateGuideFormValuesPkk = {
    originAddress: {
      name: 'John Doe',
      lastName: 'Smith',
      phone: '5551234567',
      email: 'john@example.com',
      street1: 'Origin Street 123',
      neighborhood: 'Origin Neighborhood',
      city: 'Origin City',
      state: 'Origin State',
      zipcode: '12345',
      isResidential: false
    },
    destinationAddress: {
      name: 'Jane Smith',
      lastName: 'Johnson',
      phone: '5559876543',
      email: 'jane@example.com',
      street1: 'Destination Street 456',
      neighborhood: 'Destination Neighborhood',
      city: 'Destination City',
      state: 'Destination State',
      zipcode: '54321',
      isResidential: true
    },
    parcelInfo: {
      content: 'Electronics',
      amount: 100,
      weight: 5,
      length: 30,
      width: 20,
      height: 15
    }
  }

  const mockGoPrev = jest.fn()
  const mockCreateGuide = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display confirmation page header', () => {
    it('Given form data is provided, When the page renders, Then it should display the confirmation header', () => {
      // Given form data is provided and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display the confirmation header
      expect(screen.getByRole('heading', { name: /confirmar datos/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Display origin address information', () => {
    it('Given origin address with email, When the page renders, Then it should display all origin address details', () => {
      // Given origin address with email and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display the remitente section
      expect(screen.getByRole('heading', { name: /remitente/i })).toBeInTheDocument()

      // And it should display the name
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()

      // And it should display the formatted phone number
      expect(screen.getByText(/555-123-4567/i)).toBeInTheDocument()

      // And it should display the email
      expect(screen.getByText('john@example.com')).toBeInTheDocument()

      // And it should display the full address
      expect(screen.getByText(/origin street 123.*origin neighborhood.*origin city.*origin state.*12345/i)).toBeInTheDocument()
    })

    it('Given origin address without email, When the page renders, Then email should not be displayed', () => {
      // Given origin address without email
      const formDataWithoutEmail = {
        ...mockFormData,
        originAddress: {
          ...mockFormData.originAddress,
          email: undefined
        }
      }

      // When the page renders
      render(
        <ConfirmGuidePkk
          formData={formDataWithoutEmail}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then email should not be displayed
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display destination address information', () => {
    it('Given destination address with email, When the page renders, Then it should display all destination address details', () => {
      // Given destination address with email and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display the destinatario section
      expect(screen.getByRole('heading', { name: /destinatario/i })).toBeInTheDocument()

      // And it should display the name
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument()

      // And it should display the formatted phone number
      expect(screen.getByText(/555-987-6543/i)).toBeInTheDocument()

      // And it should display the email
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()

      // And it should display the full address
      expect(screen.getByText(/destination street 456.*destination neighborhood.*destination city.*destination state.*54321/i)).toBeInTheDocument()
    })

    it('Given destination address without email, When the page renders, Then email should not be displayed', () => {
      // Given destination address without email
      const formDataWithoutEmail = {
        ...mockFormData,
        destinationAddress: {
          ...mockFormData.destinationAddress,
          email: undefined
        }
      }

      // When the page renders
      render(
        <ConfirmGuidePkk
          formData={formDataWithoutEmail}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then email should not be displayed
      expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display parcel information', () => {
    it('Given parcel information, When the page renders, Then it should display the parcel content', () => {
      // Given parcel information and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display the paquete section
      expect(screen.getByRole('heading', { name: /paquete/i })).toBeInTheDocument()

      // And it should display the content
      expect(screen.getByText(/electronics/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display action buttons', () => {
    it('Given the page renders, When checking buttons, Then it should display back and create buttons', () => {
      // Given the page renders and When checking buttons
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display the back button
      expect(screen.getByTestId('confirm-guide-cancel-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()

      // And it should display the create guide button
      expect(screen.getByTestId('confirm-guide-send-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear guia/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Click back button', () => {
    it('Given the page is rendered, When user clicks back button, Then it should call goPrev', async () => {
      // Given the page is rendered
      const user = userEvent.setup()
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // When user clicks back button
      const backButton = screen.getByTestId('confirm-guide-cancel-button')
      await user.click(backButton)

      // Then it should call goPrev
      expect(mockGoPrev).toHaveBeenCalledTimes(1)

      // And it should not call createGuide
      expect(mockCreateGuide).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Click create guide button', () => {
    it('Given the page is rendered, When user clicks create guide button, Then it should call createGuide with correct payload', async () => {
      // Given the page is rendered
      const user = userEvent.setup()
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // When user clicks create guide button
      const createButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(createButton)

      // Then it should call createGuide with the correct payload
      expect(mockCreateGuide).toHaveBeenCalledTimes(1)
      expect(mockCreateGuide).toHaveBeenCalledWith({
        origin: expect.objectContaining({
          name: 'John Doe Smith', // verifyAndUpdateAddressPkk merges name and lastName
          phone: '+525551234567', // verifyAndUpdateAddressPkk adds +52 prefix
          email: 'john@example.com',
          street1: 'Origin Street 123',
          neighborhood: 'Origin Neighborhood',
          city: 'Origin City',
          state: 'Origin State',
          zipcode: '12345',
          isResidential: false
        }),
        destination: expect.objectContaining({
          name: 'Jane Smith Johnson', // verifyAndUpdateAddressPkk merges name and lastName
          phone: '+525559876543', // verifyAndUpdateAddressPkk adds +52 prefix
          email: 'jane@example.com',
          street1: 'Destination Street 456',
          neighborhood: 'Destination Neighborhood',
          city: 'Destination City',
          state: 'Destination State',
          zipcode: '54321',
          isResidential: true
        }),
        parcel: expect.objectContaining({
          content: 'Electronics',
          amount: 100,
          weight: 5,
          length: 30,
          width: 20,
          height: 15
        })
      })

      // And it should not call goPrev
      expect(mockGoPrev).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: Display loading state', () => {
    it('Given isPending is true, When the page renders, Then it should show loading spinner', () => {
      // Given isPending is true and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={true}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should show loading spinner
      expect(screen.getByLabelText(/loading create guide kraft/i)).toBeInTheDocument()

      // And it should not show the create guide text
      expect(screen.queryByText(/crear guia/i)).not.toBeInTheDocument()
    })

    it('Given isPending is false, When the page renders, Then it should show create guide text', () => {
      // Given isPending is false and When the page renders
      render(
        <ConfirmGuidePkk
          formData={mockFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should show create guide text
      expect(screen.getByText(/crear guia/i)).toBeInTheDocument()

      // And it should not show loading spinner
      expect(screen.queryByLabelText(/loading create guide kraft/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Handle addresses with empty optional fields', () => {
    it('Given addresses with null email, When user clicks create button, Then it should process correctly', async () => {
      // Given addresses with null email
      const user = userEvent.setup()
      const formDataWithNullEmails = {
        ...mockFormData,
        originAddress: {
          ...mockFormData.originAddress,
          email: null as any
        },
        destinationAddress: {
          ...mockFormData.destinationAddress,
          email: null as any
        }
      }

      render(
        <ConfirmGuidePkk
          formData={formDataWithNullEmails}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // When user clicks create button
      const createButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(createButton)

      // Then it should call createGuide
      expect(mockCreateGuide).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario: Display both addresses with minimal information', () => {
    it('Given addresses without emails, When the page renders, Then it should display required fields only', () => {
      // Given addresses without emails
      const minimalFormData: CreateGuideFormValuesPkk = {
        originAddress: {
          name: 'Sender',
          lastName: 'Test',
          phone: '1234567890',
          street1: 'Street A',
          neighborhood: 'Hood A',
          city: 'City A',
          state: 'State A',
          zipcode: '11111',
          isResidential: false
        },
        destinationAddress: {
          name: 'Receiver',
          lastName: 'Test',
          phone: '0987654321',
          street1: 'Street B',
          neighborhood: 'Hood B',
          city: 'City B',
          state: 'State B',
          zipcode: '22222',
          isResidential: true
        },
        parcelInfo: {
          content: 'Documents',
          amount: 50,
          weight: 1,
          length: 10,
          width: 10,
          height: 5
        }
      }

      // When the page renders
      render(
        <ConfirmGuidePkk
          formData={minimalFormData}
          isPending={false}
          goPrev={mockGoPrev}
          createGuide={mockCreateGuide}
        />
      )

      // Then it should display origin name and phone
      expect(screen.getByText(/sender/i)).toBeInTheDocument()
      expect(screen.getByText(/123-456-7890/i)).toBeInTheDocument()

      // And it should display destination name and phone
      expect(screen.getByText(/receiver/i)).toBeInTheDocument()
      expect(screen.getByText(/098-765-4321/i)).toBeInTheDocument()

      // And it should display parcel content
      expect(screen.getByText(/documents/i)).toBeInTheDocument()
    })
  })
})
