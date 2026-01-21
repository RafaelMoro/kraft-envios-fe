import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressRegionSelector } from "@/features/Addresses/AddressRegionSelector ";

describe("AddressRegionSelector", () => {
  const mockSetShowManualFields = jest.fn();
  const ManualFieldsUI = <div>Manual Fields Content</div>;
  const AutocompleteUI = <div>Autocomplete Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders autocomplete UI when showManualFields is false", () => {
    render(
      <AddressRegionSelector
        showManualFields={false}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    expect(screen.getByText("Autocomplete Content")).toBeInTheDocument();
    expect(screen.queryByText("Manual Fields Content")).not.toBeInTheDocument();
  });

  it("renders manual fields UI when showManualFields is true", () => {
    render(
      <AddressRegionSelector
        showManualFields={true}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    expect(screen.getByText("Manual Fields Content")).toBeInTheDocument();
    expect(screen.queryByText("Autocomplete Content")).not.toBeInTheDocument();
  });

  it("renders toggle switch with correct label", () => {
    render(
      <AddressRegionSelector
        showManualFields={false}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    expect(
      screen.getByText("Completar región manualmente"),
    ).toBeInTheDocument();
  });

  it("calls setShowManualFields when toggle switch is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AddressRegionSelector
        showManualFields={false}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    const toggleSwitch = screen.getByRole("switch");
    await user.click(toggleSwitch);

    expect(mockSetShowManualFields).toHaveBeenCalledTimes(1);
  });

  it("toggle switch reflects the checked state based on showManualFields prop", () => {
    const { rerender } = render(
      <AddressRegionSelector
        showManualFields={false}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    const toggleSwitch = screen.getByRole("switch");
    expect(toggleSwitch).not.toBeChecked();

    rerender(
      <AddressRegionSelector
        showManualFields={true}
        setShowManualFields={mockSetShowManualFields}
        ManualFieldsUI={ManualFieldsUI}
        AutocompleteUI={AutocompleteUI}
      />,
    );

    expect(toggleSwitch).toBeChecked();
  });
});
