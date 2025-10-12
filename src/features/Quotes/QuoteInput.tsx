import clsx from "clsx"
import { UseFormRegister } from "react-hook-form";
import { Label, TextInput } from "flowbite-react"
import { RiCloseLine } from "@remixicon/react";

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";

interface QuoteInputProps {
  label: string;
  inputId: string;
  inputType: 'number' | 'text';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  clearInput: (inputName: string) => void
  errorMessage?: string;
  isNumericInput?: boolean;
}

export const QuoteInput = ({ inputId, label, inputType, errorMessage, isNumericInput, clearInput, register }: QuoteInputProps) => {
  const buttonCss = clsx(
    "justify-self-end col-start-1 col-end-2 row-start-1 row-end-2 z-10",
    { "mr-6": inputType === 'number' },
    { "mr-2": inputType === 'text' }
  )

  return (
    <div>
      <div className="mb-2 block">
        <Label htmlFor={inputId}>{label}</Label>
      </div>
      <div className="grid grid-cols-1 grid-rows-1">
        <TextInput
          id={inputId}
          type={inputType}
          className="col-start-1 col-end-2 row-start-1 row-end-2"
          {...((isNumericInput && inputType === 'text') && { inputMode: 'numeric' })}
          {...register(inputId)}
        />
        <button className={buttonCss} onClick={() => clearInput(inputId)}>
          <RiCloseLine />
        </button>
      </div>
      { errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
    </div>
  )
}