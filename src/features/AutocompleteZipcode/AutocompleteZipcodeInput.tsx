import { Label, TextInput } from "flowbite-react"

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"
import { onlyNumberRegex } from "@/shared/types/addresses.types";
import { ZIPCODE_LENGTH_ERROR, ZIPCODE_ONLY_NUMBERS_ERROR } from "@/shared/constants/addresses.constants";

interface AutocompleteZipcodeInputProps {
  zipcode: string;
  setZipcode: (newZipcode: string) => void;
  zipcodeError: string;
  setZipcodeError: (error: string) => void;
}

/**
 * This component handles the input field validation for errors in zipcode and the changes within the input
 */
export const AutocompleteZipcodeInput = ({
  zipcode,
  setZipcode,
  zipcodeError,
  setZipcodeError,
}: AutocompleteZipcodeInputProps) => {
  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
  
      if (!value) {
        setZipcode("");
        return;
      }
      if (!onlyNumberRegex.test(value)) {
        setZipcodeError(ZIPCODE_ONLY_NUMBERS_ERROR);
        // We return here because we don't want to update the zipcode state with invalid value
        return;
      }
      if (value.length < 5 || value.length > 5) {
        setZipcodeError(ZIPCODE_LENGTH_ERROR);
      }
      if (value.length === 5) {
        setZipcodeError("");
      }
      setZipcode(value);
    };

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