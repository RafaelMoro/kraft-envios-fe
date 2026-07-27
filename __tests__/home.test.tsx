import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import HomePage from '../src/app/page'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn(),
}))

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

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

describe('Home page (/)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the public landing page with no redirect', () => {
    render(HomePage())

    expect(
      screen.getByRole('heading', { level: 1, name: /cotiza con varias paqueterías/i })
    ).toBeInTheDocument()
    expect(mockedRedirect).not.toHaveBeenCalled()
  })

  it('is callable as a page component with no arguments', () => {
    expect(() => HomePage()).not.toThrow()
  })
})
