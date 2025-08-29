import { ToggleDarkMode } from "@/shared/ui/atoms/ToggleDarkMode"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from '@testing-library/user-event'

// Mutable value used by the mocked next/headers implementation so tests can change it
let cookieValue: string | null = 'light'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    // preferences.lib expects cookies().get(...)? .value
    get: jest.fn(() => ({ value: cookieValue })),
    set: jest.fn(),
  })),
}))

describe('ToggleDarkButton', () => {
  beforeEach(() => {
    // reset mocks and DOM state
    cookieValue = 'light'
    jest.clearAllMocks()

    // mock fetch used by saveThemeApi
    // @ts-expect-error - global fetch exists in Jest environment
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }))
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    // clean up attribute to avoid cross-test pollution
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the toggle dark button', () => {
    cookieValue = 'light'
    render(<ToggleDarkMode />)

    expect(screen.getByTestId('toggle-theme-mode-button')).toBeInTheDocument()
  })

  it('toggles from light to dark on click', async () => {
    cookieValue = 'light'
    const user = userEvent.setup()

  render(<ToggleDarkMode />)

  // wait a tick so the effect that reads cookies().get(...) runs and updates component state
  await new Promise((r) => setTimeout(r, 0))

    const btn = screen.getByTestId('toggle-theme-mode-button')
    await user.click(btn)

    // saveThemeApi uses fetch; expect fetch called with theme 'dark'
    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0))
    const lastCall = (global.fetch as jest.Mock).mock.calls[0]
    expect(lastCall[0]).toBe('/api/preferences/theme')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('toggles from dark to light on click', async () => {
    cookieValue = 'dark'
    const user = userEvent.setup()

  render(<ToggleDarkMode />)

  // wait a tick so the effect that reads cookies().get(...) runs and updates component state
  await new Promise((r) => setTimeout(r, 0))

    const btn = screen.getByTestId('toggle-theme-mode-button')
    await user.click(btn)

    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0))
    const lastCall = (global.fetch as jest.Mock).mock.calls[0]
    expect(lastCall[0]).toBe('/api/preferences/theme')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})