import { Label, TextInput } from "flowbite-react"
import { HiChevronDown } from "react-icons/hi"

export const SelectAliasGE = () => {
  return (
    <div className="relative">
      <div className="mb-2 flex flex-col gap-2">
        <Label htmlFor="alias-address-ge-autocomplete">Alias del domicilio:</Label>
        {/* { errorProductSat && (
          <ErrorMessage>{errorProductSat}</ErrorMessage>
        )} */}
      </div>
      <TextInput
        data-testid="alias-address-ge-autocomplete"
        id="alias-address-ge-autocomplete"
        type="text"
        // value={searchProductSat}
        // onChange={handleChangeTerm}
        // onFocus={handleInputFocus}
        // onBlur={handleInputBlur}
        placeholder="Ropa"
        rightIcon={HiChevronDown}
        autoComplete="off"
      />
    </div>
  )
}