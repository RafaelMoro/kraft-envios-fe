import { ToggleDarkMode } from "@/shared/ui/atoms/ToggleDarkMode"
import { render, screen } from "@testing-library/react"

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    // preferences.lib expects cookies().get(...)? .value
    get: jest.fn(() => ({ value: 'light' })),
    set: jest.fn(),
  })),
}));

describe('ToggleDarkButton', () => {
  it('Show toggle dark button', () => {
    render(<ToggleDarkMode />)

    expect(screen.getByTestId('toggle-theme-mode-button')).toBeInTheDocument()
  })
})