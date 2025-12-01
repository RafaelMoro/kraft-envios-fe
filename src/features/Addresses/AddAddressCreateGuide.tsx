import React from "react";
import { SelectAddressDropdown } from "./SelectAddressDropdown";

interface AddAddressCreateGuideProps {
  // TODO: Check this typing
  PersonalDataUI: React.ElementType;
  CreateTempAddressButton: JSX.Element;
}

export const AddAddressCreateGuide = ({ PersonalDataUI, CreateTempAddressButton }: AddAddressCreateGuideProps) => {
  return (
    <div>
      <PersonalDataUI />
      <div className="flex flex-col gap-4">
        <h4 className="text-xl">Domicilio</h4>
        <p>Selecciona una dirección</p>
        <SelectAddressDropdown />
      </div>
      {CreateTempAddressButton}
    </div>
  )
}