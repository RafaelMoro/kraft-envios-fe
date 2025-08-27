
import { render, screen } from '@testing-library/react'
import { QuoteCard } from '@/features/Quotes/QuoteCard'

// Mock next/image to render a normal img tag in tests
// jest.mock('next/image', () => ({
// 	__esModule: true,
// 	default: (props: unknown) => {
// 		// eslint-disable-next-line @next/next/no-img-element
// 		// eslint-disable-next-line jsx-a11y/alt-text
// 		const { src, alt, width, height } = props as any
// 		// eslint-disable-next-line jsx-a11y/alt-text
// 		return <img src={src} alt={alt} width={width} height={height} />
// 	}
// }))

import {
	fedexQuote,
	paquetExpQuote,
	otherQuote,
	defaultQuote,
} from '../../mocks/quotes.mocks'

describe('QuoteCard', () => {
	it('Show fedex quote', () => {
		const { service, amountFormatted, source } = fedexQuote
		render(<QuoteCard quote={fedexQuote} />)

		expect(screen.getByText(service)).toBeInTheDocument()
		expect(screen.getByText(amountFormatted)).toBeInTheDocument()
		expect(screen.getByText(source)).toBeInTheDocument()
		// image should be in the document
		expect(screen.getByAltText(/fedex/i)).toBeInTheDocument()
	})

	it('Show paquetexpres quote icon', () => {
		render(<QuoteCard quote={paquetExpQuote} />)

		expect(screen.getByText(paquetExpQuote.service)).toBeInTheDocument()
		expect(screen.getByText(paquetExpQuote.amountFormatted)).toBeInTheDocument()
		// PaqueteExpressIcon renders an svg; assert the article exists
		expect(screen.getByTestId('quote-img')).toBeInTheDocument()
	})

	it('Show other provider quote', () => {
		render(<QuoteCard quote={otherQuote} />)

		expect(screen.getByText(otherQuote.service)).toBeInTheDocument()
		expect(screen.getByAltText(/other provider/i)).toBeInTheDocument()
	})

	it('show default quote image', () => {
		render(<QuoteCard quote={defaultQuote} />)

		expect(screen.getByText(defaultQuote.service)).toBeInTheDocument()
		expect(screen.getByAltText(/quote provider/i)).toBeInTheDocument()
	})
})
