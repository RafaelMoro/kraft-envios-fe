import { render, screen } from "@testing-library/react";
import { AddressRegionFields } from "@/features/Addresses/AddressRegionFields";
import { CreateAddressPayload } from "@/shared/types/addresses.types";

const mockRegister = jest.fn((name) => ({
  name,
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ref: jest.fn(),
}));

const emptyAddressData: CreateAddressPayload = {
  addressName: "",
  externalNumber: "",
  internalNumber: "",
  neighborhood: "",
  zipcode: "",
  city: [],
  town: [],
  state: "",
  reference: "",
  alias: "",
  isGEAddress: false,
};

const existingAddressData: CreateAddressPayload = {
  addressName: "Calle Principal",
  externalNumber: "123",
  internalNumber: "4",
  neighborhood: "Centro",
  zipcode: "12345",
  city: ["CDMX"],
  town: ["Cuauhtémoc"],
  state: "Ciudad de México",
  reference: "Cerca del parque",
  alias: "Casa",
  isGEAddress: false,
};

const MockCityField = () => (
  <div>
    <label htmlFor="cities">Ciudades</label>
    <input data-testid="cities" id="cities" type="text" />
  </div>
);

describe("Feature: AddressRegionFields Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Scenario: Component renders all required fields", () => {
    it("Given the component is rendered, When it displays, Then all region fields should be visible", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/colonia/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/estado de la república/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/ciudades/i)).toBeInTheDocument();
    });
  });

  describe("Scenario: Fields have correct test IDs", () => {
    it("Given the component is rendered, When checking for test IDs, Then all fields should have proper test IDs", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(screen.getByTestId("zipcode")).toBeInTheDocument();
      expect(screen.getByTestId("neighborhood")).toBeInTheDocument();
      expect(screen.getByTestId("state")).toBeInTheDocument();
      expect(screen.getByTestId("cities")).toBeInTheDocument();
    });
  });

  describe("Scenario: Fields display default values from addressData", () => {
    it("Given addressData with values, When the component renders, Then all fields should display the default values", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={existingAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Centro")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Ciudad de México")).toBeInTheDocument();
    });
  });

  describe("Scenario: Zipcode field has numeric inputMode", () => {
    it("Given the zipcode field is rendered, When checking its inputMode, Then it should be set to numeric", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      const zipcodeInput = screen.getByTestId("zipcode");
      expect(zipcodeInput).toHaveAttribute("inputMode", "numeric");
    });
  });

  describe("Scenario: Error messages are displayed for fields", () => {
    it("Given zipcode has an error, When the component renders, Then the error message should be displayed", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{
            zipcode: {
              type: "required",
              message: "El código postal es requerido",
            },
          }}
          register={mockRegister}
        />,
      );

      expect(
        screen.getByText("El código postal es requerido"),
      ).toBeInTheDocument();
    });

    it("Given neighborhood has an error, When the component renders, Then the error message should be displayed", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{
            neighborhood: {
              type: "required",
              message: "La colonia es requerida",
            },
          }}
          register={mockRegister}
        />,
      );

      expect(screen.getByText("La colonia es requerida")).toBeInTheDocument();
    });

    it("Given state has an error, When the component renders, Then the error message should be displayed", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{
            state: {
              type: "required",
              message: "El estado es requerido",
            },
          }}
          register={mockRegister}
        />,
      );

      expect(screen.getByText("El estado es requerido")).toBeInTheDocument();
    });

    it("Given multiple fields have errors, When the component renders, Then all error messages should be displayed", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{
            zipcode: {
              type: "required",
              message: "El código postal es requerido",
            },
            neighborhood: {
              type: "required",
              message: "La colonia es requerida",
            },
            state: {
              type: "required",
              message: "El estado es requerido",
            },
          }}
          register={mockRegister}
        />,
      );

      expect(
        screen.getByText("El código postal es requerido"),
      ).toBeInTheDocument();
      expect(screen.getByText("La colonia es requerida")).toBeInTheDocument();
      expect(screen.getByText("El estado es requerido")).toBeInTheDocument();
    });
  });

  describe("Scenario: No error messages when errors are empty", () => {
    it("Given no errors exist, When the component renders, Then no error messages should be displayed", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(screen.queryByText(/es requerido/i)).not.toBeInTheDocument();
    });
  });

  describe("Scenario: CityField is rendered correctly", () => {
    it("Given a CityField component is provided, When the component renders, Then the CityField should be visible", () => {
      const CustomCityField = () => (
        <div data-testid="custom-city-field">Custom City Input</div>
      );

      render(
        <AddressRegionFields
          CityField={<CustomCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(screen.getByTestId("custom-city-field")).toBeInTheDocument();
      expect(screen.getByText("Custom City Input")).toBeInTheDocument();
    });
  });

  describe("Scenario: Fields are properly registered with react-hook-form", () => {
    it("Given the component renders, When register is called, Then all fields should be registered", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      expect(mockRegister).toHaveBeenCalledWith("zipcode");
      expect(mockRegister).toHaveBeenCalledWith("neighborhood");
      expect(mockRegister).toHaveBeenCalledWith("state");
    });
  });

  describe("Scenario: Fields have correct IDs for labels", () => {
    it("Given the component is rendered, When checking field IDs, Then they should match their label htmlFor attributes", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      const zipcodeInput = screen.getByTestId("zipcode");
      const neighborhoodInput = screen.getByTestId("neighborhood");
      const stateInput = screen.getByTestId("state");

      expect(zipcodeInput).toHaveAttribute("id", "zipcode");
      expect(neighborhoodInput).toHaveAttribute("id", "neighborhood");
      expect(stateInput).toHaveAttribute("id", "state");
    });
  });

  describe("Scenario: All fields have text input type", () => {
    it("Given the component is rendered, When checking input types, Then all fields should be text inputs", () => {
      render(
        <AddressRegionFields
          CityField={<MockCityField />}
          addressData={emptyAddressData}
          errors={{}}
          register={mockRegister}
        />,
      );

      const zipcodeInput = screen.getByTestId("zipcode");
      const neighborhoodInput = screen.getByTestId("neighborhood");
      const stateInput = screen.getByTestId("state");

      expect(zipcodeInput).toHaveAttribute("type", "text");
      expect(neighborhoodInput).toHaveAttribute("type", "text");
      expect(stateInput).toHaveAttribute("type", "text");
    });
  });
});
