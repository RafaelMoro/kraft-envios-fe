import { Label, TextInput } from "flowbite-react"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface AutocompleteZipcodeInputProps {
  zipcode: string;
  zipcodeError: string;
  handleZipcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AutocompleteZipcodeInput = ({
  zipcode,
  zipcodeError,
  handleZipcodeChange,
}: AutocompleteZipcodeInputProps) => {
  return (
    <div>
      <div className="mb-2 block">
        <Label htmlFor="zipcode">Código Postal</Label>
      </div>
      <TextInput
        data-testid="zipcode"
        id="zipcode"
        type="text"
        inputMode="numeric"
        value={zipcode}
        onChange={handleZipcodeChange}
      />
      {zipcodeError && <ErrorMessage>{zipcodeError}</ErrorMessage>}
    </div>
  )
}