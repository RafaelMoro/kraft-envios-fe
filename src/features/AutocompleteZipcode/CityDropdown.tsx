import { RiArrowDownSLine } from "@remixicon/react"
import { Button, Dropdown, DropdownItem, Label, Spinner } from "flowbite-react"

import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface CityDropdownProps {
  city: string;
  cities: string[]
  cityError: string
  setCity: (newCity: string) => void
  isFetching: boolean;
}

export const CityDropdown = ({
  isFetching, city, cities, cityError, setCity
}: CityDropdownProps) => {
  return (
    <Dropdown
      label=""
      renderTrigger={() => (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="city">Ciudad</Label>
          </div>
          <Button
            className="hover:cursor-pointer flex justify-between w-full"
            data-testid="autocomplete-dropdown-city-button"
            color="light"
            disabled={isFetching || cities.length === 0}
          >
            {isFetching ? <Spinner /> : city}
            <RiArrowDownSLine />
          </Button>
          {cityError && <ErrorMessage>{cityError}</ErrorMessage>}
        </div>
      )}
    >
      <div className="overflow-y-auto max-h-52">
        {cities &&
          cities.length > 0 &&
          cities.map((item) => (
            <DropdownItem
              key={`city-${item}`}
              onClick={() => setCity(item)}
            >
              {item}
            </DropdownItem>
          ))}
      </div>
    </Dropdown>
  )
}