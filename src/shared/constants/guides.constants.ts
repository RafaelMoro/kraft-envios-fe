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
  parcelInfo: {
    content: "",
    value: 0,
    quantity: 0
  }
}

export const GET_SAT_PRODUCT_ENDPOINT = '/api/product-sat'
export const CREATE_GUIDE_MN_ENDPOINT = '/api/guides/mn'