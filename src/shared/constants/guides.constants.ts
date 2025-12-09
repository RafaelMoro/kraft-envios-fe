import { AllAliasesSavedTone, CreateGuideAddressFormValues, CreateGuideAddressFormValuesTone, CreateGuideAddressValuesWithLada, CreateGuideFormValues, CreateGuideFormValuesGE, CreateGuideFormValuesPkk, CreateGuideFormValuesTone } from "../types/guides.types";

export const DEFAULT_COMPANY = 'Kraft Envios';
// TODO: Confirm the default email
export const DEFAULT_EMAIL = 'j.temix33@gmail.com'
export const DEFAULT_REFERENCE = 'Sin referencia'
export const DEFAULT_RFC = 'XAXX010101000'

export const CREATE_GUIDE_STEPS = ["Remitente", "Destinatario", "Paquete", "Confirmar"]

export const initialAliases: AllAliasesSavedTone = {
  origin: {
    alias: "",
    town: "",
    address: {
      addressName: "",
      externalNumber: "",
      internalNumber: "",
      reference: "",
      zipcode: "",
      state: "",
      city: [],
      town: [],
      alias: "",
      neighborhood: ""
    },
    addressTone: {
      street1: "",
      neighborhood: "",
      town: "",
      external_number: "",
      state: "",
      reference: ""
    }
  },
  destination: {
    alias: "",
    town: "",
    address: {
      addressName: "",
      externalNumber: "",
      internalNumber: "",
      reference: "",
      zipcode: "",
      state: "",
      city: [],
      town: [],
      alias: "",
      neighborhood: ""
    },
    addressTone: {
      street1: "",
      neighborhood: "",
      town: "",
      external_number: "",
      state: "",
      reference: ""
    }
  }
}

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

export const initialStateAddressPkk: CreateGuideAddressValuesWithLada = {
  name: "",
  email: "",
  phone: "",
  ladaState: {
    lada: [],
    state: ""
  },
  street1: "",
  neighborhood: "",
  city: "",
  state: "",
  zipcode: "",
  isResidential: false
}

export const initialStateCreateGuideGE: CreateGuideFormValuesGE = {
  originAddress: {
    alias: ''
  },
  destinationAddress: {
    alias: ''
  },
  parcelInfo: {
    content: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    satProductId: ""
  }
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
  parcelInfo: {
    content: "",
    length: "",
    width: "",
    height: "",
    weight: ""
  }
}

export const GET_SAT_PRODUCT_ENDPOINT = '/api/product-sat'
export const CREATE_GUIDE_MN_ENDPOINT = '/api/guides/mn'
export const CREATE_GUIDE_TONE_ENDPOINT = '/api/guides/tone'
export const CREATE_GUIDE_PKK_ENDPOINT = '/api/guides/pkk'
export const CREATE_GUIDE_GE_ENDPOINT = '/api/guides/ge'
export const GET_ALIAS_ADDRESSES_GE_ENDPOINT = '/api/alias-address'
export const CREATE_ADDRESS_GE_ENDPOINT = '/api/create-address-ge'