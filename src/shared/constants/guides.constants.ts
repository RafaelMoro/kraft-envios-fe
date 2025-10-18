import { CreateGuideAddressFormValues, CreateGuideAddressFormValuesTone, CreateGuideAddressValuesPkk, CreateGuideFormValues, CreateGuideFormValuesPkk, CreateGuideFormValuesTone } from "../types/guides.types";

export const DEFAULT_COMPANY = 'Kraft Envios';
// TODO: Confirm the default email
export const DEFAULT_EMAIL = 'j.temix33@gmail.com'
export const DEFAULT_REFERENCE = 'Sin referencia'

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

export const initialStateAddressTone: CreateGuideAddressFormValuesTone = {
  name: "",
  lastName: "",
  street1: "",
  neighborhood: "",
  town: "",
  external_number: "",
  state: "",
  phone: "",
  email: "",
  reference: ""
}

export const initialStateAddressPkk: CreateGuideAddressValuesPkk = {
  name: "",
  email: "",
  phone: "",
  street1: "",
  neighborhood: "",
  city: "",
  state: "",
  zipcode: "",
  isResidential: false
}

export const initialStateFormTone: CreateGuideFormValuesTone = {
  originAddress: initialStateAddressTone,
  destinationAddress: initialStateAddressTone,
  parcelInfo: {
    content: "",
    notifyMe: false,
  }
}

export const initialStateFormPkk: CreateGuideFormValuesPkk = {
  originAddress: initialStateAddressPkk,
  destinationAddress: initialStateAddressPkk,
}

export const GET_SAT_PRODUCT_ENDPOINT = '/api/product-sat'
export const CREATE_GUIDE_MN_ENDPOINT = '/api/guides/mn'
export const CREATE_GUIDE_MN_ENDPOINT_TONE = '/api/guides/tone'