import React, { ReactNode } from "react";

interface AddAddressCreateGuideProps {
  // TODO: Check this typing
  PersonalDataUI: React.ElementType;
  CreateTempAddressButton: JSX.Element;
  children: ReactNode;
}

export const AddAddressCreateGuide = ({ PersonalDataUI, CreateTempAddressButton, children }: AddAddressCreateGuideProps) => {
  return (
    <div>
      <PersonalDataUI />
      <div className="flex flex-col gap-4">
        <h4 className="text-xl">Domicilio</h4>
        <p>Selecciona una dirección</p>
        {children}
      </div>
      {CreateTempAddressButton}
    </div>
  )
}