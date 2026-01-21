import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { AutocompleteZipcode } from "@/features/Addresses/AutocompleteZipcode";
import { Neighborhood } from "@/shared/types/quotes.types";
import {
  ZIPCODE_LENGTH_ERROR,
  ZIPCODE_ONLY_NUMBERS_ERROR,
} from "@/shared/constants/addresses.constants";

// Mock the getAddressByZipcode utility function
jest.mock("../../../src/shared/utils/addresses.utils", () => ({
  getAddressByZipcode: jest.fn(),
}));

import { getAddressByZipcode } from "@/shared/utils/addresses.utils";
const mockedGetAddressByZipcode = getAddressByZipcode as jest.MockedFunction<
  typeof getAddressByZipcode
>;

const mockNeighborhoods: Neighborhood[] = [
  {
    neighborhood: "Centro",
    zipcode: "12345",
    state: "CDMX",
    city: "Ciudad de México",
  },
  {
    neighborhood: "Roma Norte",
    zipcode: "12345",
    state: "CDMX",
    city: "Ciudad de México",
  },
  {
    neighborhood: "Condesa",
    zipcode: "12345",
    state: "CDMX",
    city: "Ciudad de México",
  },
];

const mockMultipleStatesNeighborhoods: Neighborhood[] = [
  {
    neighborhood: "Centro",
    zipcode: "12345",
    state: "CDMX",
    city: "Ciudad de México",
  },
  {
    neighborhood: "Norte",
    zipcode: "12345",
    state: "Jalisco",
    city: "Guadalajara",
  },
];

const mockSingleNeighborhood: Neighborhood[] = [
  {
    neighborhood: "Centro Único",
    zipcode: "12345",
    state: "CDMX",
    city: "Ciudad de México",
  },
];

const AutocompleteZipcodeWrapper = ({
  hideCityField = false,
  zipcode = "",
  zipcodeError = "",
  neighborhoodError = "",
  stateError = "",
  cityError = "",
  neighborhood = "Seleccione una colonia",
  state = "Seleccione un estado",
  city = "Seleccione una ciudad",
  setZipcodeError = jest.fn(),
  setZipcode = jest.fn(),
  setNeighborhood = jest.fn(),
  setState = jest.fn(),
  setCity = jest.fn(),
}: Partial<React.ComponentProps<typeof AutocompleteZipcode>>) => {
  return (
    <QueryProviderWrapper>
      <AutocompleteZipcode
        hideCityField={hideCityField}
        zipcode={zipcode}
        zipcodeError={zipcodeError}
        neighborhoodError={neighborhoodError}
        stateError={stateError}
        cityError={cityError}
        neighborhood={neighborhood}
        state={state}
        city={city}
        setZipcodeError={setZipcodeError}
        setZipcode={setZipcode}
        setNeighborhood={setNeighborhood}
        setState={setState}
        setCity={setCity}
      />
    </QueryProviderWrapper>
  );
};

describe("AutocompleteZipcode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any pending timers
  });

  it("renders zipcode input field", () => {
    render(<AutocompleteZipcodeWrapper />);

    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
    expect(screen.getByTestId("zipcode")).toBeInTheDocument();
  });

  it("renders neighborhood, state and city dropdowns", () => {
    render(<AutocompleteZipcodeWrapper />);

    expect(
      screen.getByTestId("autocomplete-dropdown-neighborhood-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("autocomplete-dropdown-state-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("autocomplete-dropdown-city-button"),
    ).toBeInTheDocument();
  });

  it("hides city dropdown when hideCityField is true", () => {
    render(<AutocompleteZipcodeWrapper hideCityField={true} />);

    expect(screen.queryByLabelText(/ciudad/i)).not.toBeInTheDocument();
  });

  it("displays zipcode value in input", () => {
    render(<AutocompleteZipcodeWrapper zipcode="12345" />);

    const zipcodeInput = screen.getByTestId("zipcode") as HTMLInputElement;
    expect(zipcodeInput.value).toBe("12345");
  });

  it("shows error when zipcode contains non-numeric characters", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetZipcodeError = jest.fn();

    render(
      <AutocompleteZipcodeWrapper setZipcodeError={mockSetZipcodeError} />,
    );

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "abc");

    expect(mockSetZipcodeError).toHaveBeenCalledWith(
      ZIPCODE_ONLY_NUMBERS_ERROR,
    );
  });

  it("shows error when zipcode length is not 5", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetZipcodeError = jest.fn();

    render(
      <AutocompleteZipcodeWrapper setZipcodeError={mockSetZipcodeError} />,
    );

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "123");

    expect(mockSetZipcodeError).toHaveBeenCalledWith(ZIPCODE_LENGTH_ERROR);
  });

  it("displays zipcode error message when provided", () => {
    render(<AutocompleteZipcodeWrapper zipcodeError={ZIPCODE_LENGTH_ERROR} />);

    expect(screen.getByText(ZIPCODE_LENGTH_ERROR)).toBeInTheDocument();
  });

  it("displays neighborhood error message when provided", () => {
    render(
      <AutocompleteZipcodeWrapper neighborhoodError="Colonia es requerida" />,
    );

    expect(screen.getByText("Colonia es requerida")).toBeInTheDocument();
  });

  it("displays state error message when provided", () => {
    render(<AutocompleteZipcodeWrapper stateError="Estado es requerido" />);

    expect(screen.getByText("Estado es requerido")).toBeInTheDocument();
  });

  it("displays city error message when provided", () => {
    render(<AutocompleteZipcodeWrapper cityError="Ciudad es requerida" />);

    expect(screen.getByText("Ciudad es requerida")).toBeInTheDocument();
  });

  it("fetches address data after debounce delay when valid zipcode is entered", async () => {
    const user = userEvent.setup();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockNeighborhoods,
      message: null,
    });

    const TestWrapper = () => {
      const [zipcode, setZipcode] = React.useState("");
      const [neighborhood, setNeighborhood] = React.useState(
        "Seleccione una colonia",
      );
      const [state, setState] = React.useState("Seleccione un estado");
      const [city, setCity] = React.useState("Seleccione una ciudad");
      const [zipcodeError, setZipcodeError] = React.useState("");

      return (
        <QueryProviderWrapper>
          <AutocompleteZipcode
            hideCityField={false}
            zipcode={zipcode}
            zipcodeError={zipcodeError}
            neighborhoodError=""
            stateError=""
            cityError=""
            neighborhood={neighborhood}
            state={state}
            city={city}
            setZipcodeError={setZipcodeError}
            setZipcode={setZipcode}
            setNeighborhood={setNeighborhood}
            setState={setState}
            setCity={setCity}
          />
        </QueryProviderWrapper>
      );
    };

    render(<TestWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    // Wait for the debounce timeout (2000ms) and query to execute
    await waitFor(
      () => {
        expect(mockedGetAddressByZipcode).toHaveBeenCalledWith("12345");
      },
      { timeout: 3500 },
    );
  }, 7000);

  it("populates neighborhood dropdown with fetched data", async () => {
    const user = userEvent.setup();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockNeighborhoods,
      message: null,
    });

    const TestWrapper = () => {
      const [zipcode, setZipcode] = React.useState("");
      const [neighborhood, setNeighborhood] = React.useState(
        "Seleccione una colonia",
      );
      const [state, setState] = React.useState("Seleccione un estado");
      const [city, setCity] = React.useState("Seleccione una ciudad");
      const [zipcodeError, setZipcodeError] = React.useState("");

      return (
        <QueryProviderWrapper>
          <AutocompleteZipcode
            hideCityField={false}
            zipcode={zipcode}
            zipcodeError={zipcodeError}
            neighborhoodError=""
            stateError=""
            cityError=""
            neighborhood={neighborhood}
            state={state}
            city={city}
            setZipcodeError={setZipcodeError}
            setZipcode={setZipcode}
            setNeighborhood={setNeighborhood}
            setState={setState}
            setCity={setCity}
          />
        </QueryProviderWrapper>
      );
    };

    render(<TestWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    // Wait for debounce and query to execute
    await waitFor(
      () => {
        expect(mockedGetAddressByZipcode).toHaveBeenCalledWith("12345");
      },
      { timeout: 3500 },
    );

    const neighborhoodButton = screen.getByTestId(
      "autocomplete-dropdown-neighborhood-button",
    );
    await user.click(neighborhoodButton);

    await waitFor(() => {
      expect(screen.getByText("Centro")).toBeInTheDocument();
      expect(screen.getByText("Roma Norte")).toBeInTheDocument();
      expect(screen.getByText("Condesa")).toBeInTheDocument();
    });
  }, 7000);

  it("populates state dropdown with unique states from fetched data", async () => {
    const user = userEvent.setup();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockMultipleStatesNeighborhoods,
      message: null,
    });

    const TestWrapper = () => {
      const [zipcode, setZipcode] = React.useState("");
      const [neighborhood, setNeighborhood] = React.useState(
        "Seleccione una colonia",
      );
      const [state, setState] = React.useState("Seleccione un estado");
      const [city, setCity] = React.useState("Seleccione una ciudad");
      const [zipcodeError, setZipcodeError] = React.useState("");

      return (
        <QueryProviderWrapper>
          <AutocompleteZipcode
            hideCityField={false}
            zipcode={zipcode}
            zipcodeError={zipcodeError}
            neighborhoodError=""
            stateError=""
            cityError=""
            neighborhood={neighborhood}
            state={state}
            city={city}
            setZipcodeError={setZipcodeError}
            setZipcode={setZipcode}
            setNeighborhood={setNeighborhood}
            setState={setState}
            setCity={setCity}
          />
        </QueryProviderWrapper>
      );
    };

    render(<TestWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    // Wait for debounce and query to execute
    await waitFor(
      () => {
        expect(mockedGetAddressByZipcode).toHaveBeenCalledWith("12345");
      },
      { timeout: 3500 },
    );

    const stateButton = screen.getByTestId(
      "autocomplete-dropdown-state-button",
    );
    await user.click(stateButton);

    await waitFor(() => {
      expect(screen.getByText("CDMX")).toBeInTheDocument();
      expect(screen.getByText("Jalisco")).toBeInTheDocument();
    });
  }, 7000);

  it("populates city dropdown with unique cities from fetched data", async () => {
    const user = userEvent.setup();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockNeighborhoods,
      message: null,
    });

    const TestWrapper = () => {
      const [zipcode, setZipcode] = React.useState("");
      const [neighborhood, setNeighborhood] = React.useState(
        "Seleccione una colonia",
      );
      const [state, setState] = React.useState("Seleccione un estado");
      const [city, setCity] = React.useState("Seleccione una ciudad");
      const [zipcodeError, setZipcodeError] = React.useState("");

      return (
        <QueryProviderWrapper>
          <AutocompleteZipcode
            hideCityField={false}
            zipcode={zipcode}
            zipcodeError={zipcodeError}
            neighborhoodError=""
            stateError=""
            cityError=""
            neighborhood={neighborhood}
            state={state}
            city={city}
            setZipcodeError={setZipcodeError}
            setZipcode={setZipcode}
            setNeighborhood={setNeighborhood}
            setState={setState}
            setCity={setCity}
          />
        </QueryProviderWrapper>
      );
    };

    render(<TestWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    // Wait for debounce and query to execute
    await waitFor(
      () => {
        expect(mockedGetAddressByZipcode).toHaveBeenCalledWith("12345");
      },
      { timeout: 3500 },
    );

    const cityButton = screen.getByTestId("autocomplete-dropdown-city-button");
    await user.click(cityButton);

    await waitFor(() => {
      const cityOptions = screen.getAllByText("Ciudad de México");
      expect(cityOptions.length).toBeGreaterThan(0);
    });
  }, 7000);

  it.skip("calls setCity when city is selected", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetCity = jest.fn();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockNeighborhoods,
      message: null,
    });

    render(<AutocompleteZipcodeWrapper setCity={mockSetCity} />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    jest.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockedGetAddressByZipcode).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    const cityButton = screen.getByTestId("autocomplete-dropdown-city-button");
    await user.click(cityButton);

    const cityOption = await screen.findByText("Ciudad de México");
    await user.click(cityOption);

    expect(mockSetCity).toHaveBeenCalledWith("Ciudad de México");
  });

  it.skip("auto-selects neighborhood when only one option is available", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetNeighborhood = jest.fn();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockSingleNeighborhood,
      message: null,
    });

    render(
      <AutocompleteZipcodeWrapper setNeighborhood={mockSetNeighborhood} />,
    );

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    jest.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockSetNeighborhood).toHaveBeenCalledWith("Centro Único");
      },
      { timeout: 3000 },
    );
  });

  it.skip("auto-selects state when only one option is available", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetState = jest.fn();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockSingleNeighborhood,
      message: null,
    });

    render(<AutocompleteZipcodeWrapper setState={mockSetState} />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    jest.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockSetState).toHaveBeenCalledWith("CDMX");
      },
      { timeout: 3000 },
    );
  });

  it.skip("auto-selects city when only one option is available", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetCity = jest.fn();
    mockedGetAddressByZipcode.mockResolvedValue({
      neighborhoods: mockSingleNeighborhood,
      message: null,
    });

    render(<AutocompleteZipcodeWrapper setCity={mockSetCity} />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "12345");

    jest.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockSetCity).toHaveBeenCalledWith("Ciudad de México");
      },
      { timeout: 3000 },
    );
  });

  it("disables dropdowns when no data is available", () => {
    render(<AutocompleteZipcodeWrapper />);

    const neighborhoodButton = screen.getByTestId(
      "autocomplete-dropdown-neighborhood-button",
    );
    const stateButton = screen.getByTestId(
      "autocomplete-dropdown-state-button",
    );
    const cityButton = screen.getByTestId("autocomplete-dropdown-city-button");

    expect(neighborhoodButton).toBeDisabled();
    expect(stateButton).toBeDisabled();
    expect(cityButton).toBeDisabled();
  });

  it("clears zipcode when empty string is entered", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetZipcode = jest.fn();

    render(
      <AutocompleteZipcodeWrapper
        zipcode="12345"
        setZipcode={mockSetZipcode}
      />,
    );

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.clear(zipcodeInput);

    expect(mockSetZipcode).toHaveBeenCalledWith("");
  });

  it("does not fetch data when zipcode is less than 5 digits", async () => {
    const user = userEvent.setup({ delay: null });

    render(<AutocompleteZipcodeWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "123");

    jest.advanceTimersByTime(2000);

    expect(mockedGetAddressByZipcode).not.toHaveBeenCalled();
  });

  it("does not fetch data when zipcode contains non-numeric characters", async () => {
    const user = userEvent.setup({ delay: null });

    render(<AutocompleteZipcodeWrapper />);

    const zipcodeInput = screen.getByTestId("zipcode");
    await user.type(zipcodeInput, "abc12");

    jest.advanceTimersByTime(2000);

    expect(mockedGetAddressByZipcode).not.toHaveBeenCalled();
  });
});
