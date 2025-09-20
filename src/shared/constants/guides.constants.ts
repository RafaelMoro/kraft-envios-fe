import { CreateGuideAddressFormValues, CreateGuideFormValues } from "../types/guides.types";

export const initialStateAddressForm: CreateGuideAddressFormValues = {
  name: "",
  street1: "",
  neighborhood: "",
  external_number: "",
  city: "",
  company: "",
  state: "",
  phone: "",
  email: "",
  reference: ""
}

export const initialStateForm: CreateGuideFormValues = {
  originAddress: initialStateAddressForm,
  destinationAddress: initialStateAddressForm,
}