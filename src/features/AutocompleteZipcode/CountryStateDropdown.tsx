"use client"
import { RiArrowDownSLine } from "@remixicon/react";
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface StateDropdownProps {
  state: string;
  states: string[]
  stateError: string
  isFetching: boolean;
  setState: (newState: string) => void
}

export const CountryStateDropdown = ({
  isFetching, state, states, stateError, setState
}: StateDropdownProps) => {
  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="state">Estado de la República</Label>
          </div>
          <Button
            className="hover:cursor-pointer flex justify-between w-full"
            data-testid="autocomplete-dropdown-state-button"
            color="light"
            disabled={isFetching || states.length === 0}
          >
            {isFetching ? <Spinner /> : state}
            <RiArrowDownSLine />
          </Button>
          {stateError && <ErrorMessage>{stateError}</ErrorMessage>}
        </div>
      )}
    >
      <div className="overflow-y-auto max-h-52">
        {states &&
          states.length > 0 &&
          states.map((item) => (
            <DropdownItem
              key={`state-${item}`}
              onClick={() => setState(item)}
            >
              {item}
            </DropdownItem>
          ))}
      </div>
    </Dropdown>
  )
}