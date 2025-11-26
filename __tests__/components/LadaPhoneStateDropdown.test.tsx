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
})
