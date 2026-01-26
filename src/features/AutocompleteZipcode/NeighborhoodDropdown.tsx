"use client"
import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface NeighborhoodDropdownProps {
  neighborhood: string;
  neighborhoods: string[]
  neighborhoodError: string
  isFetching: boolean;
  setNeighborhood: (newNeighborhood: string) => void
}

export const NeighborhoodDropdown = ({
  isFetching, neighborhood, neighborhoods, neighborhoodError, setNeighborhood
}: NeighborhoodDropdownProps) => {
  return (
    <Dropdown
        label=""
        renderTrigger={() => (
          <div>
            <div className="mb-2 block">
              <Label htmlFor="neighborhood">Colonia</Label>
            </div>
            <Button
              className="hover:cursor-pointer flex justify-between w-full"
              data-testid="autocomplete-dropdown-neighborhood-button"
              color="light"
              disabled={isFetching || neighborhoods.length === 0}
            >
              {isFetching ? <Spinner /> : neighborhood}
              <RiArrowDownSLine />
            </Button>
            {neighborhoodError && (
              <ErrorMessage>{neighborhoodError}</ErrorMessage>
            )}
          </div>
        )}
      >
        <div className="overflow-y-auto max-h-52">
          {neighborhoods &&
            neighborhoods.length > 0 &&
            neighborhoods.map((item) => (
              <DropdownItem
                key={`neighborhood-${item}`}
                onClick={() => setNeighborhood(item)}
              >
                {item}
              </DropdownItem>
            ))}
        </div>
      </Dropdown>
  )
}