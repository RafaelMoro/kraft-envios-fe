import React, { ReactNode } from "react";

interface AddAddressCreateGuideProps {
  PersonalDataUI: ReactNode;
  CreateTempAddressButton: ReactNode;
  SubmitFormUI: ReactNode;
  children: ReactNode;
}

export const AddAddressCreateGuide = ({ PersonalDataUI, CreateTempAddressButton, SubmitFormUI, children }: AddAddressCreateGuideProps) => {
  return (
    <div>
      {PersonalDataUI}
      <div className="flex flex-col gap-6 mt-8">
        <h4 className="text-xl">Domicilio</h4>
        <p>Selecciona una dirección o llene una dirección temporal</p>
        {children}
      </div>
      {CreateTempAddressButton}
      {SubmitFormUI}
    </div>
  )
}