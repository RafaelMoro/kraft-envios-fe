import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LadaPhoneStateDropdown } from '@/shared/ui/organisms/LadaPhoneStateDropdown'
import { useLadaPhoneStateDropdown } from '@/shared/hooks/useLadaPhoneStateDropdown'

// Test component that combines both the hook and the component
const LadaPhoneStateDropdownWrapper = () => {
  const { ladaState, setLadaState, errorLadaState, setErrorLadaState } = useLadaPhoneStateDropdown()
  
  return (
    <LadaPhoneStateDropdown
      ladaState={ladaState}
      errorLadaState={errorLadaState}
      setLadaState={setLadaState}
      updateLadaStateError={setErrorLadaState}
    />
  )
}

describe('LadaPhoneStateDropdown', () => {
  it('Given a user wants to select a state with single lada, When clicking on a state option, Then the state and lada should be selected and dropdown should close', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Focus on input to show dropdown
    await user.click(input)
    
    // Find and click on "Ciudad de México" which has a single lada
    const ciudadMexicoOption = screen.getByText(/Ciudad de México/)
    await user.click(ciudadMexicoOption)
    
    // Verify the input shows the selected state and lada
    expect(input).toHaveValue('Ciudad de México +55')
    
    // Verify dropdown is closed (no options visible)
    expect(screen.queryByText(/Guadalajara, Jalisco/)).not.toBeInTheDocument()
  })

  it('Given a user wants to select a state with multiple ladas, When clicking on a state option, Then the lada options should be displayed and dropdown should stay open', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Focus on input to show dropdown
    await user.click(input)
    
    // Find and click on "Puebla, Puebla" which has multiple ladas (220, 221, 222)
    const pueblaOption = screen.getByText(/Puebla, Puebla/)
    await user.click(pueblaOption)
    
    // Verify lada options are displayed
    expect(screen.getByText(/^\+220$/)).toBeInTheDocument()
    expect(screen.getByText(/^\+221$/)).toBeInTheDocument()
    expect(screen.getByText(/^\+222$/)).toBeInTheDocument()
    
    // Select one of the ladas
    const lada221 = screen.getByText(/^\+221$/)
    await user.click(lada221)
    
    // Verify the input shows the selected state and lada
    expect(input).toHaveValue('Puebla, Puebla +221')
    
    // Verify dropdown is now closed
    expect(screen.queryByText(/^\+220$/)).not.toBeInTheDocument()
  })

  it('Given a user types in the input, When filtering by state name, Then only matching states should be displayed', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type to filter by state name
    await user.type(input, 'guadalajara')
    
    // Verify only Guadalajara option is visible
    expect(screen.getByText(/Guadalajara, Jalisco/)).toBeInTheDocument()
    expect(screen.queryByText(/Ciudad de México/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Monterrey, Nuevo León/)).not.toBeInTheDocument()
  })

  it('Given a user types in the input, When filtering by lada code, Then only matching states should be displayed', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type to filter by lada code
    await user.type(input, '55')
    
    // Verify only Ciudad de México option is visible (has lada 55)
    expect(screen.getByText(/Ciudad de México/)).toBeInTheDocument()
    expect(screen.queryByText(/Guadalajara, Jalisco/)).not.toBeInTheDocument()
  })

  it('Given a user focuses on input, When the input gains focus, Then dropdown should be shown with all options', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Initially dropdown should not be visible
    expect(screen.queryByText(/Ciudad de México/)).not.toBeInTheDocument()
    
    // Focus on input
    await user.click(input)
    
    // Verify dropdown is shown with options
    expect(screen.getByText(/Ciudad de México/)).toBeInTheDocument()
    expect(screen.getByText(/Guadalajara, Jalisco/)).toBeInTheDocument()
    expect(screen.getByText(/Monterrey, Nuevo León/)).toBeInTheDocument()
  })

  it('Given a user types special characters, When input contains invalid characters, Then error message should be displayed', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type special characters
    await user.type(input, 'test@#$')
    
    // Verify error message is displayed
    expect(screen.getByText(/No se permiten caracteres especiales/i)).toBeInTheDocument()
  })

  it('Given a user clears the input, When input is empty, Then all options should be displayed', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type something first
    await user.type(input, 'guadalajara')
    
    // Verify only filtered option is visible
    expect(screen.getByText(/Guadalajara, Jalisco/)).toBeInTheDocument()
    expect(screen.queryByText(/Ciudad de México/)).not.toBeInTheDocument()
    
    // Clear the input
    await user.clear(input)
    await user.click(input)
    
    // Verify all options are shown again
    expect(screen.getByText(/Ciudad de México/)).toBeInTheDocument()
    expect(screen.getByText(/Guadalajara, Jalisco/)).toBeInTheDocument()
    expect(screen.getByText(/Monterrey, Nuevo León/)).toBeInTheDocument()
  })

  it('Given a user selects a state with error, When selecting a valid state, Then error should be cleared', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type special characters to trigger error
    await user.type(input, '@')
    
    // Verify error is displayed
    expect(screen.getByText(/No se permiten caracteres especiales/i)).toBeInTheDocument()
    
    // Clear and select a valid state
    await user.clear(input)
    await user.click(input)
    const ciudadMexicoOption = screen.getByText(/Ciudad de México/)
    await user.click(ciudadMexicoOption)
    
    // Verify error is cleared
    expect(screen.queryByText(/No se permiten caracteres especiales/i)).not.toBeInTheDocument()
  })

  it('Given a user types with plus sign, When filtering by lada with plus sign, Then matching states should be displayed', async () => {
    const user = userEvent.setup()
    render(<LadaPhoneStateDropdownWrapper />)

    const input = screen.getByTestId('lada-phone-autocomplete')
    
    // Type lada with plus sign
    await user.type(input, '+33')
    
    // Verify Guadalajara option is visible (has lada 33)
    expect(screen.getByText(/Guadalajara, Jalisco/)).toBeInTheDocument()
    expect(screen.queryByText(/Ciudad de México/)).not.toBeInTheDocument()
  })
})
