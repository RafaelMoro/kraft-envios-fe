import { QuoteUI } from '@/shared/types/quotes.types'

export const fedexQuote: QuoteUI = {
  id: '1',
  service: 'Overnight',
  total: 100,
  source: 'Provider A',
  amountFormatted: '$100.00',
  logoSrc: {
    source: '/fedex.png',
    provider: 'fedex',
    width: 80,
    height: 80,
  }
}

export const paquetExpQuote: QuoteUI = {
  id: '2',
  service: 'Express',
  total: 50,
  source: 'Provider B',
  amountFormatted: '$50.00',
  logoSrc: {
    source: '/paquet.png',
    provider: 'paquetexpres',
    width: 80,
    height: 80,
  }
}

export const otherQuote: QuoteUI = {
  id: '3',
  service: 'Economy',
  total: 25,
  source: 'Provider C',
  amountFormatted: '$25.00',
  logoSrc: {
    source: '/other.png',
    provider: 'other',
    width: 60,
    height: 60,
  }
}

export const defaultQuote: QuoteUI = {
  id: '4',
  service: 'Standard',
  total: 30,
  source: 'Provider D',
  amountFormatted: '$30.00',
  logoSrc: {
    source: '/default.png',
    provider: 'dhl',
    width: 60,
    height: 60,
  }
}
