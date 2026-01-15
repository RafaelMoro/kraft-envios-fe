import { Address } from "../types/addresses.types";
import {
  AllAliasesSavedTone, AllAliasSavedMn, CreateGuideAddressDataMnFormValues, CreateGuideAddressDataToneFormValues, CreateGuideAddressFormValuesMn,
  CreateGuideAddressFormValuesTone, CreateGuideFormValuesMn, CreateGuideFormValuesGE, CreateGuideFormValuesPkk,
  CreateGuideFormValuesTone,
  AllAliasSavedPkk,
  CreateGuideAddressDataPkkFormValues,
  CreateGuideAddressValuesPkk
} from "../types/guides.types";

export const DEFAULT_COMPANY = 'Kraft Envios';
// TODO: Confirm the default email
export const DEFAULT_EMAIL = 'j.temix33@gmail.com'
export const DEFAULT_REFERENCE = 'Sin referencia'
export const DEFAULT_RFC = 'XAXX010101000'

export const CREATE_GUIDE_STEPS = ["Remitente", "Destinatario", "Paquete", "Confirmar"]

const defaultAddress: Address = {
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
}

const defaultAddressTone: CreateGuideAddressDataToneFormValues = {
  street1: "",
  neighborhood: "",
  town: "",
  external_number: "",
  state: "",
  reference: ""
}

const defaultAddressMn: CreateGuideAddressDataMnFormValues = {
  street1: "",
  neighborhood: "",
  city: "",
  external_number: "",
  state: "",
  reference: ""
}

const defaultAddressPkk: CreateGuideAddressDataPkkFormValues = {
  street1: "",
  neighborhood: "",
  city: "",
  state: "",
  zipcode: "",
}

export const initialAliasesTone: AllAliasesSavedTone = {
  origin: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressTone: {...defaultAddressTone}
  },
  destination: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressTone: {...defaultAddressTone}
  }
}

export const initialAliasesMn: AllAliasSavedMn = {
  origin: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressMn: {...defaultAddressMn}
  },
  destination: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressMn: {...defaultAddressMn}
  }
}

export const initialAliasPkk: AllAliasSavedPkk = {
  origin: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressPkk: {...defaultAddressPkk}
  },
  destination: {
    alias: "",
    town: "",
    city: "",
    address: {...defaultAddress},
    addressPkk: {...defaultAddressPkk}
  }
}

export const initialStateAddressForm: CreateGuideAddressFormValuesMn = {
  name: "",
  lastName: "",
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


export const initialStateForm: CreateGuideFormValuesMn = {
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
  lastName: "",
  email: "",
  phone: "",
  street1: "",
  neighborhood: "",
  city: "",
  state: "",
  zipcode: "",
  isResidential: false
}

export const initialStateCreateGuideGE: CreateGuideFormValuesGE = {
  originAddress: {
    address: {
      alias: ''
    },
    information: {
      addressName: '',
      externalNumber: '',
      internalNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    }
  },
  destinationAddress: {
    address: {
      alias: ''
    },
    information: {
      addressName: '',
      externalNumber: '',
      internalNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    }
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
export const GET_ALIAS_ADDRESSES_GE_ENDPOINT = '/api/ge-address'
export const CREATE_ADDRESS_GE_ENDPOINT = '/api/create-address-ge'