
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuoteCard } from '@/features/Quotes/QuoteCard'

import {
	fedexQuote,
	paquetExpQuote,
	otherQuote,
	defaultQuote,
} from '../../mocks/quotes.mocks'

describe('QuoteCard', () => {
	const mockAddSelectedQuote = jest.fn()
	const mockRemoveSelectedQuote = jest.fn()
	const mockHandleCreateGuide = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
	})

	const defaultProps = {
		addSelectedQuote: mockAddSelectedQuote,
		removeSelectedQuote: mockRemoveSelectedQuote,
		handleCreateGuide: mockHandleCreateGuide
	}

	describe('GIVEN the QuoteCard is rendered with different quote types', () => {
		it('WHEN rendered with FedEx quote THEN it should display FedEx quote information', () => {
			const { service, amountFormatted, source } = fedexQuote
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			expect(screen.getByText(service)).toBeInTheDocument()
			expect(screen.getByText(amountFormatted)).toBeInTheDocument()
			expect(screen.getByText(source)).toBeInTheDocument()
			expect(screen.getByAltText('Fedex provider')).toBeInTheDocument()
			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})

		it('WHEN rendered with PaquetExpress quote THEN it should display PaquetExpress icon', () => {
			render(<QuoteCard quote={paquetExpQuote} {...defaultProps} />)

			expect(screen.getByText(paquetExpQuote.service)).toBeInTheDocument()
			expect(screen.getByText(paquetExpQuote.amountFormatted)).toBeInTheDocument()
			expect(screen.getByText(paquetExpQuote.source)).toBeInTheDocument()
			expect(screen.getByTestId('quote-img')).toBeInTheDocument()
			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})

		it('WHEN rendered with other provider quote THEN it should display other provider information', () => {
			render(<QuoteCard quote={otherQuote} {...defaultProps} />)

			expect(screen.getByText(otherQuote.service)).toBeInTheDocument()
			expect(screen.getByText(otherQuote.amountFormatted)).toBeInTheDocument()
			expect(screen.getByText(otherQuote.source)).toBeInTheDocument()
			expect(screen.getByAltText('Other provider')).toBeInTheDocument()
			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})

		it('WHEN rendered with default quote THEN it should display default quote image', () => {
			render(<QuoteCard quote={defaultQuote} {...defaultProps} />)

			expect(screen.getByTestId('quote-title')).toHaveTextContent(defaultQuote.service)
			expect(screen.getByText(defaultQuote.amountFormatted)).toBeInTheDocument()
			expect(screen.getByText(defaultQuote.source)).toBeInTheDocument()
			expect(screen.getByAltText('Quote provider')).toBeInTheDocument()
			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})
	})

	describe('GIVEN the user interacts with the checkbox', () => {
		it('WHEN checkbox is checked THEN it should call addSelectedQuote', async () => {
			const user = userEvent.setup()
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const checkbox = screen.getByRole('checkbox')
			await user.click(checkbox)

			expect(mockAddSelectedQuote).toHaveBeenCalledWith(fedexQuote)
			expect(mockRemoveSelectedQuote).not.toHaveBeenCalled()
		})

		it('WHEN checkbox is unchecked THEN it should call removeSelectedQuote', async () => {
			const user = userEvent.setup()
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const checkbox = screen.getByRole('checkbox')
			
			// First check the checkbox
			await user.click(checkbox)
			expect(mockAddSelectedQuote).toHaveBeenCalledWith(fedexQuote)
			
			// Then uncheck it
			await user.click(checkbox)
			expect(mockRemoveSelectedQuote).toHaveBeenCalledWith(fedexQuote.id)
		})
	})

	describe('GIVEN the user interacts with the Crear guía button', () => {
		it('WHEN Crear guía button is clicked THEN it should call handleCreateGuide', async () => {
			const user = userEvent.setup()
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const createGuideButton = screen.getByRole('button', { name: /crear guía/i })
			await user.click(createGuideButton)

			expect(mockHandleCreateGuide).toHaveBeenCalledWith(fedexQuote)
		})
	})

	describe('GIVEN different quote provider scenarios', () => {
		it('WHEN quote has NextDay courier THEN it should be treated as 99 provider', () => {
			const nextDayQuote = { 
				...defaultQuote, 
				courier: 'NextDay' as const,
				logoSrc: { ...defaultQuote.logoSrc, provider: 'ninetyNineMin' as const }
			}
			render(<QuoteCard quote={nextDayQuote} {...defaultProps} />)

			expect(screen.getByAltText('Other provider')).toBeInTheDocument()
		})

		it('WHEN quote has fedex provider THEN it should render with special styling', () => {
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const titleElement = screen.getByText(fedexQuote.service)
			expect(titleElement).toHaveClass('place-self-end', 'justify-self-start')
		})

		it('WHEN quote has other provider THEN it should render with special styling', () => {
			render(<QuoteCard quote={otherQuote} {...defaultProps} />)

			const titleElement = screen.getByText(otherQuote.service)
			expect(titleElement).toHaveClass('place-self-end', 'justify-self-start')
		})
	})

	describe('GIVEN the QuoteCard structure and accessibility', () => {
		it('WHEN rendered THEN it should have proper article structure with testid', () => {
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const article = screen.getByTestId('quote-img')
			expect(article).toBeInTheDocument()
			expect(article.tagName).toBe('ARTICLE')
		})

		it('WHEN rendered THEN it should display source with building icon', () => {
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			expect(screen.getByText(fedexQuote.source)).toBeInTheDocument()
			// The building icon should be present (RiBuilding3Line component)
			const sourceContainer = screen.getByText(fedexQuote.source).parentElement
			expect(sourceContainer).toBeInTheDocument()
		})

		it('WHEN rendered THEN checkbox should be clickable', () => {
			render(<QuoteCard quote={fedexQuote} {...defaultProps} />)

			const checkbox = screen.getByRole('checkbox')
			expect(checkbox).toBeInTheDocument()
			expect(checkbox).not.toBeDisabled()
		})
	})
})
