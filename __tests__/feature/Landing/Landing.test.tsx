import { render, screen, within } from '@testing-library/react'
import { Landing } from '@/features/Landing/Landing'
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  REGISTER_ROUTE,
} from '@/shared/constants/global.constants'
import {
  LANDING_COURIERS,
  LANDING_COURIER_DISCLAIMER,
  LANDING_HERO_IMAGE_ALT,
  LANDING_LEGAL_NOTICE,
} from '@/shared/constants/landing.constants'

beforeAll(() => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }))
})

describe('Landing', () => {
  it('renders the hero H1', () => {
    render(<Landing />)

    expect(
      screen.getByRole('heading', { level: 1, name: /cotiza con varias paqueterías/i })
    ).toBeInTheDocument()
  })

  it('renders every section heading in comp order', () => {
    render(<Landing />)

    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

    expect(headings).toEqual([
      'Enviar no tiene que ser complicado',
      'Todo tu envío, en un solo panel',
      'Hecho para quien envía todos los días',
      'Las paqueterías que ya conoces',
      'Preguntas frecuentes',
      'Tu próximo envío empieza aquí',
    ])
  })

  it('renders the hero image with its alt text', () => {
    render(<Landing />)

    expect(screen.getByRole('img', { name: LANDING_HERO_IMAGE_ALT })).toBeInTheDocument()
  })

  it('renders the mandatory courier disclaimer and legal notice', () => {
    render(<Landing />)

    expect(screen.getByText(LANDING_COURIER_DISCLAIMER)).toBeInTheDocument()
    expect(screen.getByText(LANDING_LEGAL_NOTICE)).toBeInTheDocument()
  })

  it('renders each courier name once as accessible text in the marquee, with the duplicate half aria-hidden', () => {
    render(<Landing />)

    const marquee = screen.getByTestId('courier-marquee')

    LANDING_COURIERS.forEach((courier) => {
      const matches = within(marquee).getAllByText(courier)
      expect(matches).toHaveLength(2)

      const hiddenMatches = matches.filter((match) => match.closest('[aria-hidden="true"]'))
      const visibleMatches = matches.filter((match) => !match.closest('[aria-hidden="true"]'))
      expect(hiddenMatches).toHaveLength(1)
      expect(visibleMatches).toHaveLength(1)
    })
  })

  it('resolves every "Crear cuenta" style CTA to REGISTER_ROUTE', () => {
    render(<Landing />)

    const registerLinks = screen.getAllByRole('link', { name: /crear cuenta/i })
    expect(registerLinks.length).toBeGreaterThan(0)
    registerLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', REGISTER_ROUTE)
    })

    expect(screen.getByRole('link', { name: /crear mi cuenta/i })).toHaveAttribute('href', REGISTER_ROUTE)
    expect(screen.getByRole('link', { name: /^cotizar$/i })).toHaveAttribute('href', REGISTER_ROUTE)
  })

  it('resolves every "Iniciar sesión" CTA to LOGIN_ROUTE', () => {
    render(<Landing />)

    const loginLinks = screen.getAllByRole('link', { name: /iniciar sesión/i })
    expect(loginLinks.length).toBeGreaterThan(0)
    loginLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', LOGIN_ROUTE)
    })
  })

  it('resolves the footer "Mi saldo" CTA to DASHBOARD_ROUTE', () => {
    render(<Landing />)

    expect(screen.getByRole('link', { name: /mi saldo/i })).toHaveAttribute('href', DASHBOARD_ROUTE)
  })

  it('renders no legal links in the footer', () => {
    render(<Landing />)

    expect(screen.queryByRole('link', { name: /aviso de privacidad/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /términos y condiciones/i })).not.toBeInTheDocument()
  })
})
