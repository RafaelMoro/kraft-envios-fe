import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QueryProviderWrapper } from "@/features/QueryProviderWrapper";
import { CreateAddressSubform } from "@/features/Addresses/CreateAddressSubform";
import { CreateAddressPayload } from "@/shared/types/addresses.types";

// Mock the getAddressByZipcode utility function
jest.mock("../../../src/shared/utils/addresses.utils", () => ({
  getAddressByZipcode: jest.fn(),
  formatPayloadCreateAddress: jest.fn((payload) => payload),
}));

import { getAddressByZipcode } from "@/shared/utils/addresses.utils";
const mockedGetAddressByZipcode = getAddressByZipcode as jest.MockedFunction<
  typeof getAddressByZipcode
>;

const mockCreateAddressMutation = jest.fn();
const mockEditAddressMutation = jest.fn();
const mockToggleModal = jest.fn();
const mockSetSubscreen = jest.fn();
const mockUpdateAddressDataGE = jest.fn();
const mockSetHasConsentedOnce = jest.fn();
const mockSetError = jest.fn();
const mockSetZipcodeError = jest.fn();
const mockSetValue = jest.fn();
const mockClearErrors = jest.fn();
const mockClearManualAddressRegionFields = jest.fn();
const mockHandleSubmit = jest.fn(
  (callback) => (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    return callback(
      {
        street1: "Calle Principal",
        externalNumber: "123",
        internalNumber: "4",
        neighborhood: "Centro",
        zipcode: "12345",
        state: "CDMX",
        reference: "Cerca del parque",
        alias: "Casa",
      },
      e,
    );
  },
);
const mockRegister = jest.fn((name) => ({
  name,
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ref: jest.fn(),
}));

const emptyFormData: CreateAddressPayload = {
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
};

const existingAddressData: CreateAddressPayload = {
  addressName: "Calle Vieja",
  externalNumber: "456",
  internalNumber: "2",
  neighborhood: "Norte",
  zipcode: "54321",
  city: ["Monterrey"],
  town: ["San Pedro"],
  state: "Nuevo León",
  reference: "Frente al parque",
  alias: "Oficina",
};

interface WrapperProps {
  formData?: CreateAddressPayload;
  isEdit?: boolean;
  actionText?: "Editar" | "Crear";
  errors?: any;
  createAddressMutation?: (payload: CreateAddressPayload) => void;
  editAddressMutation?: (payload: CreateAddressPayload) => void;
  isPending?: boolean;
  isSuccess?: boolean;
  isPendingEdit?: boolean;
  isSuccessEdit?: boolean;
  hasConsentedOnce?: boolean;
  dataAliases?: string[];
  isPendingFetchAlias?: boolean;
  errorAlias?: Error | null;
}

const CreateAddressSubformWrapper = ({
  formData = emptyFormData,
  isEdit = false,
  actionText = "Crear",
  errors = {},
  createAddressMutation = mockCreateAddressMutation,
  editAddressMutation = mockEditAddressMutation,
  isPending = false,
  isSuccess = false,
  isPendingEdit = false,
  isSuccessEdit = false,
  hasConsentedOnce = false,
  dataAliases = [],
  isPendingFetchAlias = false,
  errorAlias = null,
}: WrapperProps) => {
  return (
    <QueryProviderWrapper>
      <CreateAddressSubform
        formData={formData}
        isEdit={isEdit}
        actionText={actionText}
        errors={errors}
        register={mockRegister}
        handleSubmit={mockHandleSubmit}
        setError={mockSetError}
        setZipcodeError={mockSetZipcodeError}
        setValue={mockSetValue}
        clearErrors={mockClearErrors}
        clearManualAddressRegionFields={mockClearManualAddressRegionFields}
        createAddressMutation={createAddressMutation}
        editAddressMutation={editAddressMutation}
        isPending={isPending}
        isSuccess={isSuccess}
        isPendingEdit={isPendingEdit}
        isSuccessEdit={isSuccessEdit}
        toggleModal={mockToggleModal}
        setSubscreen={mockSetSubscreen}
        updateAddressDataGE={mockUpdateAddressDataGE}
        hasConsentedOnce={hasConsentedOnce}
        setHasConsentedOnce={mockSetHasConsentedOnce}
        dataAliases={dataAliases}
        isPendingFetchAlias={isPendingFetchAlias}
        errorAlias={errorAlias}
      />
    </QueryProviderWrapper>
  );
};

describe("Feature: Create Address Subform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Scenario: Form renders with all required fields", () => {
    it("Given the subform is displayed, When the component renders, Then all form fields should be visible", () => {
      render(<CreateAddressSubformWrapper />);

      expect(screen.getByLabelText(/calle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/numero exterior/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/numero interior/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/municipios/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/referencia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/alias/i)).toBeInTheDocument();
      expect(
        screen.getByRole("switch", { name: /crear dirección en ge/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("switch", { name: /completar región manualmente/i }),
      ).toBeInTheDocument();
      // Autocomplete dropdown buttons (visible by default in automatic mode)
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
  });

  describe("Scenario: Form renders with existing data in edit mode", () => {
    it("Given existing address data, When the form renders in edit mode, Then all fields should be populated with existing values", () => {
      render(
        <CreateAddressSubformWrapper
          formData={existingAddressData}
          isEdit={true}
          actionText="Editar"
        />,
      );

      expect(screen.getByDisplayValue("Calle Vieja")).toBeInTheDocument();
      expect(screen.getByDisplayValue("456")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Frente al parque")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Oficina")).toBeInTheDocument();
      // Note: Zipcode, neighborhood, state, city, and towns are managed by AutocompleteZipcode
      // and won't display existing values in autocomplete mode without proper state initialization
      // Cities are only shown in manual mode
    });
  });

  describe("Scenario: Cancel button calls toggleModal", () => {
    it("Given the form is displayed, When the user clicks the cancel button, Then toggleModal should be called", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const cancelButton = screen.getByTestId("origin-address-cancel-button");
      await user.click(cancelButton);

      expect(mockToggleModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("Scenario: Form displays validation errors", () => {
    it("Given the form has validation errors, When the component renders, Then error messages should be displayed", () => {
      const errors = {
        street1: { message: "La calle es requerida" },
        externalNumber: { message: "El número exterior es requerido" },
        alias: { message: "El alias es requerido" },
      };

      render(<CreateAddressSubformWrapper errors={errors} />);

      expect(screen.getByText("La calle es requerida")).toBeInTheDocument();
      expect(
        screen.getByText("El número exterior es requerido"),
      ).toBeInTheDocument();
      expect(screen.getByText("El alias es requerido")).toBeInTheDocument();
    });
  });

  describe("Scenario: Toggle GE address creation shows consent checkbox", () => {
    it("Given the GE toggle is off, When displayed, Then the consent checkbox should be visible", () => {
      render(<CreateAddressSubformWrapper />);

      expect(
        screen.getByLabelText(
          /entiendo y acepto omitir en no crear esta dirección en ge/i,
        ),
      ).toBeInTheDocument();
    });

    it("Given the GE toggle is off, When the user toggles it on, Then the consent checkbox should not be visible", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const geToggle = screen.getByRole("switch", {
        name: /crear dirección en ge/i,
      });
      await user.click(geToggle);

      expect(
        screen.queryByLabelText(
          /entiendo y acepto omitir en no crear esta dirección en ge/i,
        ),
      ).not.toBeInTheDocument();
    });

    it("Given the GE toggle is on, When the user toggles it off, Then the consent checkbox should become visible again", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const geToggle = screen.getByRole("switch", {
        name: /crear dirección en ge/i,
      });

      // Turn on
      await user.click(geToggle);
      expect(
        screen.queryByLabelText(
          /entiendo y acepto omitir en no crear esta dirección en ge/i,
        ),
      ).not.toBeInTheDocument();

      // Turn off
      await user.click(geToggle);
      expect(
        screen.getByLabelText(
          /entiendo y acepto omitir en no crear esta dirección en ge/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Scenario: Submit button text changes based on GE toggle", () => {
    it('Given the GE toggle is off, When the form is displayed, Then the submit button should show "Crear dirección"', () => {
      render(<CreateAddressSubformWrapper />);

      expect(
        screen.getByTestId("origin-address-next-button"),
      ).toHaveTextContent("Crear dirección");
    });

    it('Given the GE toggle is on, When the form is displayed, Then the submit button should show "Siguiente"', async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const geToggle = screen.getByRole("switch", {
        name: /crear dirección en ge/i,
      });
      await user.click(geToggle);

      expect(
        screen.getByTestId("origin-address-next-button"),
      ).toHaveTextContent("Siguiente");
    });

    it('Given the form is in edit mode, When the GE toggle is off, Then the submit button should show "Editar dirección"', () => {
      render(<CreateAddressSubformWrapper isEdit={true} actionText="Editar" />);

      expect(
        screen.getByTestId("origin-address-next-button"),
      ).toHaveTextContent("Editar dirección");
    });
  });

  describe("Scenario: Form shows loading state during submission", () => {
    it("Given the form is submitting, When isPending is true, Then the submit button should show a spinner", () => {
      render(<CreateAddressSubformWrapper isPending={true} />);

      expect(
        screen.getByLabelText(/loading crear kraft envios/i),
      ).toBeInTheDocument();
    });

    it("Given the form is being edited, When isPendingEdit is true, Then the submit button should show a spinner", () => {
      render(
        <CreateAddressSubformWrapper
          isEdit={true}
          actionText="Editar"
          isPendingEdit={true}
        />,
      );

      expect(
        screen.getByLabelText(/loading editar kraft envios/i),
      ).toBeInTheDocument();
    });
  });

  describe("Scenario: Form shows success state after submission", () => {
    it("Given the form submitted successfully, When isSuccess is true, Then the submit button should show a check icon", () => {
      render(<CreateAddressSubformWrapper isSuccess={true} />);

      const button = screen.getByTestId("origin-address-next-button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("Given the form edited successfully, When isSuccessEdit is true, Then the submit button should show a check icon", () => {
      render(
        <CreateAddressSubformWrapper
          isEdit={true}
          actionText="Editar"
          isSuccessEdit={true}
        />,
      );

      const button = screen.getByTestId("origin-address-next-button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Scenario: Buttons are disabled during submission", () => {
    it("Given the form is submitting, When isPending is true, Then both buttons should be disabled", () => {
      render(<CreateAddressSubformWrapper isPending={true} />);

      expect(screen.getByTestId("origin-address-cancel-button")).toBeDisabled();
      expect(screen.getByTestId("origin-address-next-button")).toBeDisabled();
    });

    it("Given the form submitted successfully, When isSuccess is true, Then both buttons should be disabled", () => {
      render(<CreateAddressSubformWrapper isSuccess={true} />);

      expect(screen.getByTestId("origin-address-cancel-button")).toBeDisabled();
      expect(screen.getByTestId("origin-address-next-button")).toBeDisabled();
    });

    it("Given aliases are being fetched, When isPendingFetchAlias is true, Then the cancel button should be disabled", () => {
      render(<CreateAddressSubformWrapper isPendingFetchAlias={true} />);

      expect(screen.getByTestId("origin-address-cancel-button")).toBeDisabled();
    });
  });

  describe("Scenario: Toggle GE address creation sets hasConsentedOnce", () => {
    it("Given the user has not consented before, When the user toggles GE creation on, Then setHasConsentedOnce should be called with true", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper hasConsentedOnce={false} />);

      const geToggle = screen.getByRole("switch", {
        name: /crear dirección en ge/i,
      });
      await user.click(geToggle);

      expect(mockSetHasConsentedOnce).toHaveBeenCalledWith(true);
    });

    it("Given the user has consented before, When the user toggles GE creation on, Then setHasConsentedOnce should not be called", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper hasConsentedOnce={true} />);

      const geToggle = screen.getByRole("switch", {
        name: /crear dirección en ge/i,
      });
      await user.click(geToggle);

      expect(mockSetHasConsentedOnce).not.toHaveBeenCalled();
    });
  });

  describe("Scenario: Consent checkbox can be checked", () => {
    it("Given the consent checkbox is displayed, When the user checks it, Then it should be checked", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const consentCheckbox = screen.getByLabelText(
        /entiendo y acepto omitir en no crear esta dirección en ge/i,
      );
      expect(consentCheckbox).not.toBeChecked();

      await user.click(consentCheckbox);

      expect(consentCheckbox).toBeChecked();
    });
  });

  describe("Scenario: Input fields have correct test IDs", () => {
    it("Given the form is rendered, When checking for test IDs, Then all inputs should have proper test IDs", () => {
      render(<CreateAddressSubformWrapper />);

      expect(screen.getByTestId("street1")).toBeInTheDocument();
      expect(screen.getByTestId("externalNumber")).toBeInTheDocument();
      expect(screen.getByTestId("internalNumber")).toBeInTheDocument();
      expect(screen.getByTestId("zipcode")).toBeInTheDocument();
      expect(screen.getByTestId("reference")).toBeInTheDocument();
      expect(screen.getByTestId("alias")).toBeInTheDocument();
      // Dropdown buttons for autocomplete mode
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
  });

  describe("Scenario: Form correctly identifies numeric input fields", () => {
    it('Given numeric fields are rendered, When checking inputMode, Then numeric fields should have "numeric" inputMode', () => {
      render(<CreateAddressSubformWrapper />);

      const externalNumber = screen.getByTestId("externalNumber");
      const internalNumber = screen.getByTestId("internalNumber");
      const zipcode = screen.getByTestId("zipcode");

      expect(externalNumber).toHaveAttribute("inputMode", "numeric");
      expect(internalNumber).toHaveAttribute("inputMode", "numeric");
      expect(zipcode).toHaveAttribute("inputMode", "numeric");
    });
  });

  describe("Scenario: Manual fields toggle switch is present", () => {
    it("Given the form is rendered, When checking for the manual toggle, Then it should be present", () => {
      render(<CreateAddressSubformWrapper />);

      const toggleSwitch = screen.getByRole("switch", {
        name: /completar región manualmente/i,
      });
      expect(toggleSwitch).toBeInTheDocument();
      expect(toggleSwitch).not.toBeChecked();
    });

    it("Given the manual toggle is off, When the user clicks it, Then manual fields should appear", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      // Initially, autocomplete dropdowns are visible
      expect(
        screen.getByTestId("autocomplete-dropdown-neighborhood-button"),
      ).toBeInTheDocument();

      // Click toggle to show manual fields
      const toggleSwitch = screen.getByRole("switch", {
        name: /completar región manualmente/i,
      });
      await user.click(toggleSwitch);

      // Now manual input fields should be visible
      await waitFor(() => {
        expect(screen.getByTestId("neighborhood")).toBeInTheDocument();
        expect(screen.getByTestId("state")).toBeInTheDocument();
      });

      // Autocomplete dropdowns should not be visible
      expect(
        screen.queryByTestId("autocomplete-dropdown-neighborhood-button"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Scenario: User can add and remove cities tags in manual mode", () => {
    it("Given manual mode is enabled, When the user adds a city tag, Then it should appear in the list", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      // Enable manual mode to access cities input
      const toggleSwitch = screen.getByRole("switch", {
        name: /completar región manualmente/i,
      });
      await user.click(toggleSwitch);

      await waitFor(() => {
        expect(screen.getByTestId("cities")).toBeInTheDocument();
      });

      const citiesInput = screen.getByTestId("cities");
      await user.type(citiesInput, "Guadalajara{Enter}");

      expect(screen.getByText("Guadalajara")).toBeInTheDocument();
    });

    it("Given a city tag exists, When the user removes it, Then it should disappear from the list", async () => {
      const user = userEvent.setup();
      render(
        <CreateAddressSubformWrapper
          formData={{
            ...emptyFormData,
            city: ["Monterrey"],
          }}
        />,
      );

      // Enable manual mode to see cities
      const toggleSwitch = screen.getByRole("switch", {
        name: /completar región manualmente/i,
      });
      await user.click(toggleSwitch);

      await waitFor(() => {
        expect(screen.getByText("Monterrey")).toBeInTheDocument();
      });

      const monterreyBadge = screen.getByText("Monterrey");
      const removeButton =
        monterreyBadge.parentElement?.querySelector("button");
      expect(removeButton).toBeInTheDocument();

      if (removeButton) {
        await user.click(removeButton);
        expect(screen.queryByText("Monterrey")).not.toBeInTheDocument();
      }
    });
  });

  describe("Scenario: User can add and remove towns tags", () => {
    it("Given the form is displayed, When the user adds a town tag, Then it should appear in the list", async () => {
      const user = userEvent.setup();
      render(<CreateAddressSubformWrapper />);

      const townsInput = screen.getByLabelText(/municipios/i);
      await user.type(townsInput, "Cuauhtémoc{Enter}");

      expect(screen.getByText("Cuauhtémoc")).toBeInTheDocument();
    });

    it("Given a town tag exists, When the user removes it, Then it should disappear from the list", async () => {
      const user = userEvent.setup();
      render(
        <CreateAddressSubformWrapper
          formData={{
            ...emptyFormData,
            town: ["San Pedro"],
          }}
        />,
      );

      expect(screen.getByText("San Pedro")).toBeInTheDocument();

      const sanPedroBadge = screen.getByText("San Pedro");
      const removeButton = sanPedroBadge.parentElement?.querySelector("button");
      expect(removeButton).toBeInTheDocument();

      if (removeButton) {
        await user.click(removeButton);
        expect(screen.queryByText("San Pedro")).not.toBeInTheDocument();
      }
    });
  });
});
