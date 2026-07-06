import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

import { ConfirmGuideGE } from "@/features/Guides/GE/ConfirmGuideGE"
import { CreateGuideFormValuesGE, SearchProduct } from "@/shared/types/guides.types"
import { QuoteUI } from "@/shared/types/quotes.types"

const mockFormData: CreateGuideFormValuesGE = {
  originAddress: {
    address: {
      alias: 'Casa'
    },
    information: {
      addressName: 'Calle Principal',
      externalNumber: '123',
      internalNumber: '4',
      neighborhood: 'Centro',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipcode: '12345'
    }
  },
  destinationAddress: {
    address: {
      alias: 'Oficina'
    },
    information: {
      addressName: 'Avenida Reforma',
      externalNumber: '456',
      internalNumber: '2',
      neighborhood: 'Residencial',
      city: 'Monterrey',
      state: 'Nuevo León',
      zipcode: '54321'
    }
  },
  parcelInfo: {
    content: 'Libros educativos',
    satProductId: '12345',
    length: '30',
    width: '20',
    height: '10',
    weight: '5'
  }
}

const mockSelectedProduct: SearchProduct = {
  code: '12345',
  description: 'Libros de texto'
}

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

const ConfirmGuideGEWrapper = ({
  formData = mockFormData,
  selectedProduct = mockSelectedProduct,
  selectedQuotes = mockSelectedQuotes,
  isPending = false,
  goPrev = jest.fn(),
  createGuide = jest.fn()
}: Partial<React.ComponentProps<typeof ConfirmGuideGE>>) => {
  return (
    <ConfirmGuideGE
      formData={formData}
      selectedProduct={selectedProduct}
      selectedQuotes={selectedQuotes}
      isPending={isPending}
      goPrev={goPrev}
      createGuide={createGuide}
    />
  )
}

describe('Feature: Confirm Guide GE', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario: Display confirmation page heading', () => {
    it('Given the component renders, When user views the page, Then it should display the confirmation heading', () => {
      render(<ConfirmGuideGEWrapper />)

      expect(screen.getByText(/confirmar datos/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display origin address information', () => {
    it('Given formData with origin address, When the component renders, Then it should display remitente section with alias and address', () => {
      render(<ConfirmGuideGEWrapper />)

      expect(screen.getByText(/remitente/i)).toBeInTheDocument()
      expect(screen.getByText('Casa')).toBeInTheDocument()
      expect(screen.getByText(/calle principal 123, 4, centro, ciudad de méxico cdmx, c\.p\. 12345/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display destination address information', () => {
    it('Given formData with destination address, When the component renders, Then it should display destinatario section with alias and address', () => {
      render(<ConfirmGuideGEWrapper />)

      expect(screen.getByText(/datos del destinatario/i)).toBeInTheDocument()
      expect(screen.getByText('Oficina')).toBeInTheDocument()
      expect(screen.getByText(/avenida reforma 456, 2, residencial, monterrey nuevo león, c\.p\. 54321/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display parcel information', () => {
    it('Given formData with parcel info and selected product, When the component renders, Then it should display complete parcel details', () => {
      render(<ConfirmGuideGEWrapper />)

      expect(screen.getByText(/paquete/i)).toBeInTheDocument()
      expect(screen.getByText(/descripción: libros educativos/i)).toBeInTheDocument()
      expect(screen.getByText(/tipo de producto: libros de texto/i)).toBeInTheDocument()
      expect(screen.getByText(/largo: 30 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/alto: 10 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/ancho: 20 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/peso: 5 kg/i)).toBeInTheDocument()
    })

    it('Given selectedProduct is null, When the component renders, Then it should not display product description', () => {
      render(<ConfirmGuideGEWrapper selectedProduct={null} />)

      expect(screen.queryByText(/libros de texto/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display action buttons', () => {
    it('Given the component renders, When user views the page, Then it should display Regresar and Crear guia buttons', () => {
      render(<ConfirmGuideGEWrapper />)

      expect(screen.getByTestId('confirm-guide-cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-guide-send-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear guia/i })).toBeInTheDocument()
    })
  })

  describe('Scenario: Handle Regresar button click', () => {
    it('Given user clicks Regresar button, When the click event occurs, Then it should call goPrev', async () => {
      const user = userEvent.setup()
      const goPrev = jest.fn()

      render(<ConfirmGuideGEWrapper goPrev={goPrev} />)

      const regresarButton = screen.getByTestId('confirm-guide-cancel-button')
      await user.click(regresarButton)

      expect(goPrev).toHaveBeenCalled()
    })
  })

  describe('Scenario: Handle guide creation', () => {
    it('Given user clicks Crear guia button, When the click event occurs, Then it should call createGuide with correct payload', async () => {
      const user = userEvent.setup()
      const createGuide = jest.fn()

      render(<ConfirmGuideGEWrapper createGuide={createGuide} />)

      const createButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(createButton)

      expect(createGuide).toHaveBeenCalledWith({
        quoteId: 'quote-123',
        origin: {
          alias: 'Casa'
        },
        destination: {
          alias: 'Oficina'
        },
        parcel: {
          content: 'Libros educativos',
          satProductId: '12345',
          length: '30',
          width: '20',
          height: '10',
          weight: '5'
        }
      })
    })

    it('Given selectedQuotes is empty, When user clicks Crear guia, Then it should call createGuide with undefined quoteId', async () => {
      const user = userEvent.setup()
      const createGuide = jest.fn()

      render(<ConfirmGuideGEWrapper selectedQuotes={[]} createGuide={createGuide} />)

      const createButton = screen.getByTestId('confirm-guide-send-button')
      await user.click(createButton)

      expect(createGuide).toHaveBeenCalledWith(
        expect.objectContaining({
          quoteId: undefined
        })
      )
    })
  })

  describe('Scenario: Display loading spinner during guide creation', () => {
    it('Given isPending is true, When the component renders, Then it should display a spinner instead of button text', () => {
      render(<ConfirmGuideGEWrapper isPending={true} />)

      expect(screen.getByLabelText(/loading create guide kraft/i)).toBeInTheDocument()
      expect(screen.queryByText(/crear guia/i)).not.toBeInTheDocument()
    })

    it('Given isPending is false, When the component renders, Then it should display button text instead of spinner', () => {
      render(<ConfirmGuideGEWrapper isPending={false} />)

      expect(screen.getByText(/crear guia/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/loading create guide kraft/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario: Display all address components', () => {
    it('Given addresses with all fields populated, When the component renders, Then it should display complete formatted addresses', () => {
      const customFormData: CreateGuideFormValuesGE = {
        ...mockFormData,
        originAddress: {
          address: { alias: 'Home Address' },
          information: {
            addressName: 'Street Name',
            externalNumber: '100',
            internalNumber: 'A',
            neighborhood: 'Neighborhood',
            city: 'City',
            state: 'State',
            zipcode: '00000'
          }
        }
      }

      render(<ConfirmGuideGEWrapper formData={customFormData} />)

      expect(screen.getByText('Home Address')).toBeInTheDocument()
      expect(screen.getByText(/street name 100, a, neighborhood, city state, c\.p\. 00000/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Display parcel dimensions', () => {
    it('Given parcel info with specific dimensions, When the component renders, Then it should display each dimension with its unit', () => {
      const customFormData: CreateGuideFormValuesGE = {
        ...mockFormData,
        parcelInfo: {
          content: 'Electronics',
          satProductId: '99999',
          length: '50',
          width: '40',
          height: '30',
          weight: '10'
        }
      }

      render(<ConfirmGuideGEWrapper formData={customFormData} />)

      expect(screen.getByText(/largo: 50 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/ancho: 40 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/alto: 30 cm/i)).toBeInTheDocument()
      expect(screen.getByText(/peso: 10 kg/i)).toBeInTheDocument()
    })
  })
})
