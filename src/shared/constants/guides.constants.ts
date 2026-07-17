import { Address } from "../types/addresses.types";
import {
  AllAliasesSavedTone, AllAliasSavedMn, CreateGuideAddressDataMnFormValues, CreateGuideAddressDataToneFormValues, CreateGuideAddressFormValuesMn,
  CreateGuideAddressFormValuesTone, CreateGuideFormValuesMn, CreateGuideFormValuesGE, CreateGuideFormValuesPkk,
  CreateGuideFormValuesTone,
  AllAliasSavedPkk,
  CreateGuideAddressDataPkkFormValues,
  CreateGuideAddressValuesPkk,
  CreateGuideDbAddressFormValues,
  CreateGuideDbFormValues,
  QuoteAdjustmentSourceReference,
} from "../types/guides.types";

export const DEFAULT_COMPANY = 'Kraft Envios';
export const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'placeholder@example.com'
export const DEFAULT_REFERENCE = 'Sin referencia'
export const DEFAULT_RFC = 'XAXX010101000'

export const CREATE_GUIDE_STEPS = ["Remitente", "Destinatario", "Paquete", "Confirmar"]

export const GUIDE_STATUS = {
  created: 'Creado',
  inProcess: 'En proceso',
  transit: 'En tránsito'
} as const;

export const ERROR_TONE_GUIDES_SERVER_MESSAGE = 'T1 failed to get guides'
export const ERROR_GE_GUIDES_SERVER_MESSAGE = 'GE Error'

export const ERROR_TONE_GUIDES_USER_MESSAGE = 'No se pudo obtener las guías de TONE.'
export const ERROR_GE_GUIDES_USER_MESSAGE = 'No se pudo obtener las guías de GE.'
export const ERROR_GUIDES_USER_MESSAGE_BASE = 'No se pudo obtener las guías de'

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

export const initialStateAddressGuideDb: CreateGuideDbAddressFormValues = {
  alias: "",
  name: "",
  lastName: "",
  phone: "",
  email: "",
  company: "",
  street1: "",
  neighborhood: "",
  external_number: "",
  city: "",
  town: "",
  state: "",
  zipcode: "",
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
export const CREATE_GUIDE_DB_ENDPOINT = '/api/guides-db'
export const GET_ALIAS_ADDRESSES_GE_ENDPOINT = '/api/ge-address'
export const GET_GUIDES_ENDPOINT = '/api/guides/get-guides'
export const CREATE_ADDRESS_GE_ENDPOINT = '/api/ge-address'
export const GET_GUIDES_DB_ENDPOINT = '/api/guides-db'
export const DELETE_GUIDE_DB_ENDPOINT = '/api/guides-db'
export const UPDATE_GUIDE_DB_ENDPOINT = '/api/guides-db'

export const initialStateFormGuideDb: CreateGuideDbFormValues = {
  originAddress: { ...initialStateAddressForm },
  destinationAddress: { ...initialStateAddressForm },
  parcelInfo: {
    content: '',
    value: '',
    quantity: '',
    notifyMe: false,
  },
}

export const GUIDE_DB_PROVIDER_FAILED_MESSAGE =
  'La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte.'

export const GUIDE_DB_GENERIC_FAILED_MESSAGE =
  'La guía se guardó en Kraft, pero ocurrió un error al crearla con el proveedor. Por favor, intente nuevamente.'

export const GUIDE_DB_GENERIC_ERROR_MESSAGE =
  'Ocurrió un error al crear la guía. Por favor, intente nuevamente.'

export const GUIDES_DB_EMPTY_MESSAGE = 'No hay guias para el mes seleccionado.'

export const GUIDES_DB_ERROR_MESSAGE = 'Ha sucedido un error. Intentelo nuevamente'

export const GUIDES_DB_ADMIN_SCOPE_ALL_LABEL = 'Todas las guías'
export const GUIDES_DB_ADMIN_SCOPE_OWN_LABEL = 'Mis guías'
export const GUIDES_DB_ADMIN_INCLUDE_DELETED_LABEL = 'Incluir guías eliminadas'
export const GUIDES_DB_ADMIN_INCLUDE_INTERNAL_PRICING_LABEL = 'Mostrar precio interno'
export const GUIDES_DB_DELETED_MESSAGE = 'Eliminada el {date} por {deletedBy}'
export const GUIDES_DB_INTERNAL_PRICING_SECTION_TITLE = 'PRECIO INTERNO'

export const GUIDES_DB_DELETE_MODAL_TITLE = '¿Deseas eliminar esta guia?'
export const GUIDES_DB_DELETE_MODAL_BODY = 'Esta acción no se puede deshacer.'
export const GUIDES_DB_DELETE_MODAL_CONFIRM = 'Eliminar'
export const GUIDES_DB_DELETE_MODAL_CANCEL = 'Cancelar'
export const GUIDES_DB_DELETE_ERROR_MESSAGE = 'No se pudo eliminar la guía. Por favor, intenta nuevamente.'
export const GUIDES_DB_EDIT_MODAL_TITLE = 'Editar guía'
export const GUIDES_DB_EDIT_NO_CHANGES_MESSAGE = 'Para continuar, modifica al menos un dato de la guía.'
export const GUIDES_DB_EDIT_REQUOTE_MESSAGE = 'Estos datos vienen de la cotización y no se pueden editar aquí. Para cambiarlos, genera una nueva cotización.'
export const GUIDES_DB_REQUOTE_MESSAGE = 'Las dimensiones del paquete vienen de tu cotización. Para cambiarlas, vuelve a cotizar.'

export const GUIDES_DB_HARD_DELETE_MODAL_TITLE = '¿Eliminar permanentemente esta guía?'
export const GUIDES_DB_HARD_DELETE_MODAL_BODY = 'Esta acción removerá el registro de la base de datos de forma permanente. No se puede deshacer.'
export const GUIDES_DB_HARD_DELETE_MODAL_CONFIRM = 'Eliminar permanentemente'

export const GUIDES_DB_INTERNAL_PRICING_FIELDS: Record<string, string> = {
  qBaseRef: 'Base',
  qAdjFactor: 'Factor de ajuste',
  qAdjBasis: 'Base de ajuste',
  qAdjMode: 'Modo de ajuste',
  qAdjSrcRef: 'Origen del ajuste',
}

export const GUIDES_DB_INTERNAL_PRICING_SOURCE_LABELS: Record<QuoteAdjustmentSourceReference, string> = {
  default: 'Global',
  custom: 'Personalizado',
}

export const GUIDE_DB_FAILURE_MESSAGES: Record<string, string> = {
  'GDE-PVR-005': 'El proveedor rechazó algunos datos de la guía. Revisa la información del envío e intenta crearla nuevamente.',
  'GDE-PVR-006': 'La cotización expiró antes de crear la guía. Genera una nueva cotización e intenta nuevamente.',
  'GDE-NET-001': 'No pudimos conectar con el proveedor. Intenta nuevamente en unos minutos.',
  'GDE-TMOT-001': 'El proveedor tardó demasiado en responder. Intenta nuevamente en unos minutos.',
  'GDE-RLIM-003': 'El proveedor recibió demasiadas solicitudes. Espera unos minutos e intenta nuevamente.',
}

export const GUIDE_DB_GENERIC_FAILURE_MESSAGE = 'No pudimos crear la guía con el proveedor. Intenta nuevamente o contacta a soporte.'
