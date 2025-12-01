import React from "react";

interface AddAddressCreateGuideProps {
  PersonalDataUI: React.FC;
  CreateTempAddressButton: React.FC;
}

export const AddAddressCreateGuide = ({ PersonalDataUI, CreateTempAddressButton }: AddAddressCreateGuideProps) => {
  return (
    <div>
      <PersonalDataUI />
      <select>
        <option value="tempAddress">Selecciona una direccion</option>
      </select>
      <CreateTempAddressButton />
    </div>
  )
}