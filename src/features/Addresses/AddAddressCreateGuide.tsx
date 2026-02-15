import React, { ReactNode } from "react";

interface AddAddressCreateGuideProps {
  PersonalDataUI: ReactNode;
  CreateTempAddressButton: ReactNode;
  SubmitFormUI: ReactNode;
  children: ReactNode;
}

/**
 * General component that shows the personal data form (name, last name, phone, email etc)
 * followed by a section for address data with title, description, create temporal address button and submit buttons
 * @param PersonalDataUI - The UI component that shows the personal data form to render name, last name, phone, email inputs
 * @param CreateTempAddressButton - The UI component that shows the button to create a temporary address
 * @param SubmitFormUI - The UI component that shows the submit button for the form to continue with the guide creation
 * @param children - The UI components that belongs to the select address dropdown
 */
export const AddAddressCreateGuide = ({ PersonalDataUI, CreateTempAddressButton, SubmitFormUI, children }: AddAddressCreateGuideProps) => {
  return (
    <div>
      {PersonalDataUI}
      <div className="flex flex-col gap-4 mt-8">
        <h4 className="text-xl">Domicilio</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">Selecciona una dirección o llene una dirección temporal</p>
        {children}
      </div>
      {CreateTempAddressButton}
      {SubmitFormUI}
    </div>
  )
}